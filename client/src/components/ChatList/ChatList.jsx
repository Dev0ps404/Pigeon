import {
  FiSearch,
  FiEdit,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { useSelector, useDispatch } from "react-redux";
import { setActiveChat } from "../../redux/slices/chatSlice";
import { toggleMessagesSidebar } from "../../redux/slices/uiSlice";
import { motion } from "framer-motion";
import { format } from "date-fns";

const ChatList = ({ fetchMessages }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { chats, activeChat } = useSelector((state) => state.chat);
  const { messagesSidebarCollapsed, messagesSidebarWidth } = useSelector(
    (state) => state.ui,
  );

  const handleChatSelect = (chat) => {
    dispatch(setActiveChat(chat));
    fetchMessages(chat);
  };

  return (
    <motion.div
      animate={{
        width: messagesSidebarCollapsed
          ? 84
          : window.innerWidth < 768
            ? "100%"
            : messagesSidebarWidth,
        minWidth: messagesSidebarCollapsed
          ? 84
          : window.innerWidth < 768
            ? "100%"
            : messagesSidebarWidth,
      }}
      transition={{ duration: 0.4, ease: [0.25, 0.8, 0.25, 1] }}
      className="h-full flex flex-col bg-white/70 dark:bg-[#0c1226]/25 border-r border-slate-200/70 dark:border-white/5 z-10 overflow-hidden relative shrink-0 backdrop-blur-3xl"
    >
      {/* Header section */}
      <div
        className={`p-6 pb-4 ${messagesSidebarCollapsed ? "px-3 flex flex-col items-center gap-4" : ""}`}
      >
        {!messagesSidebarCollapsed ? (
          <div className="flex justify-between items-center mb-5 animate-fade-in">
            <h2 className="text-2xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600 dark:from-white dark:via-slate-100 dark:to-gray-400 bg-clip-text text-transparent">
              Messages
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => dispatch(toggleMessagesSidebar())}
                className="w-9 h-9 bg-slate-200/50 dark:bg-white/5 border border-slate-300/20 dark:border-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl flex items-center justify-center text-slate-650 dark:text-gray-350 hover:text-slate-900 dark:hover:text-white transition-all active:scale-95"
                title="Collapse Sidebar"
              >
                <FiChevronLeft size={16} />
              </button>
              <button
                className="w-9 h-9 bg-slate-200/50 dark:bg-white/5 border border-slate-300/20 dark:border-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl flex items-center justify-center text-slate-650 dark:text-gray-350 hover:text-slate-900 dark:hover:text-white transition-all active:scale-95"
                title="New Message"
              >
                <FiEdit size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3.5 mb-2">
            <button
              onClick={() => dispatch(toggleMessagesSidebar())}
              className="w-10 h-10 bg-slate-200/50 dark:bg-white/5 border border-slate-300/20 dark:border-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl flex items-center justify-center text-slate-655 dark:text-gray-350 hover:text-slate-900 dark:hover:text-white transition-all active:scale-95"
              title="Expand Sidebar"
            >
              <FiChevronRight size={18} />
            </button>
            <button
              className="w-10 h-10 bg-slate-200/50 dark:bg-white/5 border border-slate-300/20 dark:border-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl flex items-center justify-center text-slate-655 dark:text-gray-350 hover:text-slate-900 dark:hover:text-white transition-all active:scale-95"
              title="New Message"
            >
              <FiEdit size={18} />
            </button>
          </div>
        )}

        {/* Search box with modern glass effect */}
        {!messagesSidebarCollapsed ? (
          <div className="relative animate-fade-in focus-within:scale-[1.01] transition-transform duration-200">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 dark:text-gray-400">
              <FiSearch size={16} />
            </div>
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-11 pr-4 py-3 bg-white/80 dark:bg-white/5 border border-slate-200/70 dark:border-white/5 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/40 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 transition-all font-medium backdrop-blur-md"
            />
          </div>
        ) : (
          <button
            className="w-10 h-10 bg-slate-200/50 dark:bg-white/5 border border-slate-300/20 dark:border-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl flex items-center justify-center text-slate-500 dark:text-gray-450 hover:text-slate-900 dark:hover:text-white transition-colors"
            title="Search Messages"
          >
            <FiSearch size={18} />
          </button>
        )}
      </div>

      {/* Conversations List */}
      <div
        className={`flex-1 overflow-y-auto px-4 pb-20 md:pb-4 space-y-1.5 custom-scrollbar ${messagesSidebarCollapsed ? "px-3" : ""}`}
      >
        {chats.map((chat, idx) => {
          const chatName = chat.isGroupChat
            ? chat.chatName
            : chat.users.find((u) => u._id !== user._id)?.username;
          const chatPic = chat.isGroupChat
            ? null
            : chat.users.find((u) => u._id !== user._id)?.profilePicture;
          const isActive = activeChat?._id === chat._id;
          const otherUser = chat.isGroupChat ? null : chat.users?.find((u) => u._id !== user?._id);
          const isOnline = otherUser?.status === "online";

          return (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03, duration: 0.3 }}
              key={chat._id}
              onClick={() => handleChatSelect(chat)}
              className={`flex items-center rounded-2xl cursor-pointer transition-all duration-300 group relative ${
                messagesSidebarCollapsed ? "justify-center p-2" : "p-3"
              } ${
                isActive
                  ? "bg-gradient-to-r from-sky-500/15 via-cyan-500/10 to-emerald-500/10 border border-sky-400/30 dark:border-white/10 shadow-[0_4px_15px_rgba(14,165,233,0.08)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
                  : "hover:bg-slate-100/60 dark:hover:bg-white/5 hover:translate-x-0.5 border border-transparent hover:border-slate-200/30 dark:hover:border-white/5"
              }`}
            >
              {/* Avatar section */}
              <div className="relative flex-shrink-0">
                {chatPic ? (
                  <img
                    referrerPolicy="no-referrer"
                    src={chatPic}
                    alt="avatar"
                    className="w-12 h-12 rounded-full object-cover shadow-md border border-slate-200/70 dark:border-white/10"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-base shadow-md border border-slate-200/70 dark:border-white/10">
                    {chatName?.[0]?.toUpperCase()}
                  </div>
                )}
                {/* pulsing green online indicator */}
                {!chat.isGroupChat && isOnline && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-100 dark:border-[#111827] rounded-full z-10">
                    <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75" />
                  </span>
                )}
              </div>

              {!messagesSidebarCollapsed && (
                <div className="ml-3.5 flex-1 overflow-hidden text-left">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h3
                      className={`font-bold text-sm truncate ${isActive ? "text-sky-700 dark:text-sky-300" : "text-slate-800 dark:text-white"}`}
                    >
                      {chatName}
                    </h3>
                    <span
                      className={`text-[10px] font-bold whitespace-nowrap ml-2 ${isActive ? "text-sky-600 dark:text-sky-300" : "text-slate-400 dark:text-gray-500"}`}
                    >
                      {chat.latestMessage
                        ? format(
                            new Date(chat.latestMessage.updatedAt),
                            "HH:mm",
                          )
                        : ""}
                    </span>
                  </div>
                  <p
                    className={`text-xs truncate ${isActive ? "text-slate-600 dark:text-gray-300" : "text-slate-500 dark:text-gray-400 font-semibold"}`}
                  >
                    {chat.latestMessage
                      ? chat.latestMessage.content
                        ? chat.latestMessage.content
                        : chat.latestMessage.attachments &&
                            chat.latestMessage.attachments.length > 0
                          ? `📎 [${chat.latestMessage.attachments[0].type.charAt(0).toUpperCase() + chat.latestMessage.attachments[0].type.slice(1)}]`
                          : chat.latestMessage.mediaUrl &&
                              chat.latestMessage.mediaType !== "none"
                            ? `📎 [${chat.latestMessage.mediaType.charAt(0).toUpperCase() + chat.latestMessage.mediaType.slice(1)}]`
                            : "Say hi! 👋"
                      : "Say hi! 👋"}
                  </p>
                </div>
              )}

              {/* Collapsed State Hover Tooltip */}
              {messagesSidebarCollapsed && (
                <div className="absolute left-full ml-4 px-3 py-1.5 bg-[#111827] border border-white/10 text-white text-xs font-bold rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 whitespace-nowrap z-50 backdrop-blur-md">
                  {chatName}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default ChatList;
