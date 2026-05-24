import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { initiateSocketConnection, disconnectSocket, getSocket } from '../socket/socketClient';
import { setChats, addMessage, setMessages } from '../redux/slices/chatSlice';
import { setMessagesSidebarWidth, setProfileSidebarWidth } from '../redux/slices/uiSlice';
import api from '../services/api';
import toast from 'react-hot-toast';

import ChatList from '../components/ChatList/ChatList';
import ChatWindow from '../components/ChatWindow/ChatWindow';
import RightSidebar from '../components/RightSidebar/RightSidebar';

const Home = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { activeChat } = useSelector((state) => state.chat);
  
  const { 
    messagesSidebarCollapsed, 
    messagesSidebarWidth, 
    profileSidebarExpanded, 
    profileSidebarWidth 
  } = useSelector((state) => state.ui);

  const [socketConnected, setSocketConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const fetchChatsData = async () => {
      try {
        const { data } = await api.get('/chat');
        dispatch(setChats(data));
      } catch (error) {
        toast.error('Failed to load chats');
      }
    };
    fetchChatsData();
  }, [dispatch]);

  useEffect(() => {
    const socket = initiateSocketConnection();
    socket.emit('setup', user);
    socket.on('connected', () => setSocketConnected(true));
    socket.on('typing', () => setIsTyping(true));
    socket.on('stop typing', () => setIsTyping(false));

    socket.on('message recieved', (newMessageRecieved) => {
      if (!activeChat || activeChat._id !== newMessageRecieved.chat._id) {
        // Here we could implement unread badge logic
        toast.success(`New message from ${newMessageRecieved.sender.username}`);
      } else {
        dispatch(addMessage(newMessageRecieved));
      }
    });

    return () => disconnectSocket();
  }, [user, activeChat, dispatch]);

  const fetchMessages = async (chat) => {
    if (!chat) return;
    try {
      const { data } = await api.get(`/message/${chat._id}`);
      dispatch(setMessages(data));
      
      const socket = getSocket();
      socket?.emit('join chat', chat._id);
    } catch (error) {
      toast.error('Failed to load messages');
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
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
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
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  return (
    <div className="flex-1 flex h-full bg-[#f3f4f6] dark:bg-[#030712] overflow-hidden rounded-tl-[2.5rem] shadow-[-10px_0_30px_rgba(0,0,0,0.05)] border-t border-l border-white/50 dark:border-white/5 relative z-10">
      
      {/* Chat List Column wrapper with responsive visibility */}
      <div className={`${activeChat ? 'hidden md:flex' : 'flex'} h-full shrink-0`}>
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
      <div className={`${activeChat ? 'flex' : 'hidden md:flex'} flex-1 h-full min-w-0`}>
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
      <RightSidebar />

    </div>
  );
};

export default Home;
