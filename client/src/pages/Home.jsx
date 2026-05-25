import { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  initiateSocketConnection,
  disconnectSocket,
  getSocket,
} from "../socket/socketClient";
import { setChats, addMessage, setMessages, updateMessageInList } from "../redux/slices/chatSlice";
import {
  setMessagesSidebarWidth,
  setProfileSidebarWidth,
} from "../redux/slices/uiSlice";
import api from "../services/api";
import toast from "react-hot-toast";

import ChatList from "../components/ChatList/ChatList";
import ChatWindow from "../components/ChatWindow/ChatWindow";
import RightSidebar from "../components/RightSidebar/RightSidebar";

const Home = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { activeChat } = useSelector((state) => state.chat);

  const {
    messagesSidebarCollapsed,
    messagesSidebarWidth,
    profileSidebarExpanded,
    profileSidebarWidth,
  } = useSelector((state) => state.ui);

  const [socketConnected, setSocketConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const activeChatRef = useRef(activeChat);
  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  useEffect(() => {
    const fetchChatsData = async () => {
      try {
        const { data } = await api.get("/chat");
        dispatch(setChats(data));
      } catch (error) {
        toast.error("Failed to load chats");
      }
    };
    fetchChatsData();
  }, [dispatch]);

  useEffect(() => {
    const socket = initiateSocketConnection();
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));

    socket.on("message recieved", (newMessageRecieved) => {
      const currentActiveChat = activeChatRef.current;
      if (!currentActiveChat || currentActiveChat._id !== newMessageRecieved.chat._id) {
        // Mark as Delivered on background
        api.post(`/message/${newMessageRecieved._id}/deliver`).catch(() => {});
        socket.emit("mark-delivered", {
          messageId: newMessageRecieved._id,
          chatId: newMessageRecieved.chat._id,
          userId: user._id,
        });
        toast.success(`New message from ${newMessageRecieved.sender.username}`);
      } else {
        // Mark as Read/Seen on active chat
        api.post(`/message/${currentActiveChat._id}/read`).catch(() => {});
        socket.emit("mark-read", {
          chatId: currentActiveChat._id,
          userId: user._id,
        });
        dispatch(addMessage(newMessageRecieved));
      }
    });

    socket.on("message edited", (editedMessage) => {
      const currentActiveChat = activeChatRef.current;
      if (currentActiveChat && currentActiveChat._id === editedMessage.chat._id) {
        dispatch(updateMessageInList(editedMessage));
      }
    });

    socket.on("message deleted", (deletedMessage) => {
      const currentActiveChat = activeChatRef.current;
      if (currentActiveChat && currentActiveChat._id === deletedMessage.chat._id) {
        dispatch(updateMessageInList(deletedMessage));
      }
    });

    socket.on("message reacted", (reactedMessage) => {
      const currentActiveChat = activeChatRef.current;
      if (currentActiveChat && currentActiveChat._id === reactedMessage.chat._id) {
        dispatch(updateMessageInList(reactedMessage));
      }
    });

    return () => disconnectSocket();
  }, [user, dispatch]);

  // Auto-mark chat as read when switching active chats
  useEffect(() => {
    if (activeChat && user) {
      const markChatRead = async () => {
        try {
          await api.post(`/message/${activeChat._id}/read`);
          const socket = getSocket();
          if (socket) {
            socket.emit("mark-read", {
              chatId: activeChat._id,
              userId: user._id,
            });
          }
        } catch (err) {
          console.error("Failed to mark chat as read:", err);
        }
      };
      markChatRead();
    }
  }, [activeChat?._id, user?._id]);

  const fetchMessages = async (chat) => {
    if (!chat) return;
    try {
      const { data } = await api.get(`/message/${chat._id}`);
      dispatch(setMessages(data));

      const socket = getSocket();
      socket?.emit("join chat", chat._id);
    } catch (error) {
      toast.error("Failed to load messages");
    }
  };

  // Horizontal resizing handlers for Messages Sidebar
  const handleMessagesMouseDown = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = messagesSidebarWidth;

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      // Constraints: 240px to 480px
      const newWidth = Math.max(240, Math.min(480, startWidth + deltaX));
      dispatch(setMessagesSidebarWidth(newWidth));
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  // Horizontal resizing handlers for Right Profile Sidebar
  const handleProfileMouseDown = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = profileSidebarWidth;

    const handleMouseMove = (moveEvent) => {
      const deltaX = startX - moveEvent.clientX; // drag to the left increases right sidebar width
      // Constraints: 280px to 485px
      const newWidth = Math.max(280, Math.min(485, startWidth + deltaX));
      dispatch(setProfileSidebarWidth(newWidth));
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  return (
    <div className="flex-1 flex h-full bg-gradient-to-br from-slate-50 via-sky-50/40 to-slate-100/70 dark:from-[#0b1020]/90 dark:via-[#0c1326]/85 dark:to-[#0a1222]/90 overflow-hidden shadow-[-10px_0_40px_rgba(0,0,0,0.15)] border-t border-l border-white/60 dark:border-white/5 relative z-10 backdrop-blur-2xl">
      {/* Ambient gradient orbs (light) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 dark:hidden">
        <div className="absolute -top-[15%] -left-[10%] w-[45vw] h-[45vw] bg-sky-400/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-15%] right-[-5%] w-[40vw] h-[40vw] bg-indigo-400/10 rounded-full blur-[120px]" />
      </div>

      {/* Futuristic Mesh Gradient Background Orbs (dark) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 hidden dark:block">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-blue-600/10 rounded-full blur-[120px] animate-blob-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-purple-600/10 rounded-full blur-[120px] animate-blob-slower" />
        <div className="absolute top-[30%] right-[20%] w-[35vw] h-[35vw] bg-cyan-600/5 rounded-full blur-[100px] animate-blob-slowest" />
      </div>

      {/* Chat List Column wrapper with responsive visibility */}
      <div
        className={`${activeChat ? "hidden md:flex" : "flex"} h-full shrink-0 z-10`}
      >
        <ChatList fetchMessages={fetchMessages} />
      </div>

      {/* Resizing divider between ChatList and ChatWindow */}
      {!messagesSidebarCollapsed && !activeChat?.isGroupChat && activeChat && (
        <div
          onMouseDown={handleMessagesMouseDown}
          className="hidden md:block w-1.5 hover:w-2 bg-transparent hover:bg-blue-500/20 active:bg-blue-500 transition-all cursor-col-resize h-full flex-shrink-0 z-30 relative border-l border-r border-gray-100/10"
          title="Drag to resize messages list"
        />
      )}
      {!messagesSidebarCollapsed && !activeChat && (
        <div
          onMouseDown={handleMessagesMouseDown}
          className="hidden md:block w-1.5 hover:w-2 bg-transparent hover:bg-blue-500/20 active:bg-blue-500 transition-all cursor-col-resize h-full flex-shrink-0 z-30 relative border-l border-r border-gray-100/10"
          title="Drag to resize messages list"
        />
      )}

      {/* Main Chat Window wrapper with responsive visibility */}
      <div
        className={`${activeChat ? "flex" : "hidden md:flex"} flex-1 h-full min-w-0 z-10`}
      >
        <ChatWindow isTyping={isTyping} />
      </div>

      {/* Resizing divider between ChatWindow and RightSidebar */}
      {profileSidebarExpanded && activeChat && (
        <div
          onMouseDown={handleProfileMouseDown}
          className="hidden md:block w-1.5 hover:w-2 bg-transparent hover:bg-blue-500/20 active:bg-blue-500 transition-all cursor-col-resize h-full flex-shrink-0 z-30 relative border-l border-r border-gray-100/10"
          title="Drag to resize profile details"
        />
      )}

      {/* Profile/Info Right Sidebar */}
      <div className="z-20">
        <RightSidebar />
      </div>
    </div>
  );
};

export default Home;
