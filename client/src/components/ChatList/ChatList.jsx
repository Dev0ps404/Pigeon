import { FiSearch, FiEdit, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useSelector, useDispatch } from 'react-redux';
import { setActiveChat } from '../../redux/slices/chatSlice';
import { toggleMessagesSidebar } from '../../redux/slices/uiSlice';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

const ChatList = ({ fetchMessages }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { chats, activeChat } = useSelector((state) => state.chat);
  const { messagesSidebarCollapsed, messagesSidebarWidth } = useSelector((state) => state.ui);

  const handleChatSelect = (chat) => {
    dispatch(setActiveChat(chat));
    fetchMessages(chat);
  };

  return (
    <motion.div 
      animate={{ 
        width: messagesSidebarCollapsed ? 80 : (window.innerWidth < 768 ? '100%' : messagesSidebarWidth),
        minWidth: messagesSidebarCollapsed ? 80 : (window.innerWidth < 768 ? '100%' : messagesSidebarWidth),
      }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="h-full flex flex-col bg-white dark:bg-dark-card border-r border-gray-100 dark:border-dark-border z-10 overflow-hidden relative shrink-0"
    >
      <div className={`p-6 pb-4 ${messagesSidebarCollapsed ? 'px-2 flex flex-col items-center gap-4' : ''}`}>
        {!messagesSidebarCollapsed ? (
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Messages</h2>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => dispatch(toggleMessagesSidebar())}
                className="w-10 h-10 bg-gray-100 dark:bg-dark-bg hover:bg-gray-200 dark:hover:bg-dark-border rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 transition-colors"
                title="Collapse Sidebar"
              >
                <FiChevronLeft size={18} />
              </button>
              <button className="w-10 h-10 bg-gray-100 dark:bg-dark-bg hover:bg-gray-200 dark:hover:bg-dark-border rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 transition-colors" title="New Message">
                <FiEdit size={18} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 mb-4">
            <button 
              onClick={() => dispatch(toggleMessagesSidebar())}
              className="w-10 h-10 bg-gray-100 dark:bg-dark-bg hover:bg-gray-200 dark:hover:bg-dark-border rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 transition-colors"
              title="Expand Sidebar"
            >
              <FiChevronRight size={18} />
            </button>
            <button className="w-10 h-10 bg-gray-100 dark:bg-dark-bg hover:bg-gray-200 dark:hover:bg-dark-border rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 transition-colors" title="New Message">
              <FiEdit size={18} />
            </button>
          </div>
        )}
        
        {!messagesSidebarCollapsed ? (
          <div className="relative animate-fade-in">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
              <FiSearch size={18} />
            </div>
            <input 
              type="text" 
              placeholder="Search messages..."
              className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-dark-bg border-none rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-900 dark:text-gray-100 placeholder-gray-400 transition-all"
            />
          </div>
        ) : (
          <button className="w-10 h-10 bg-gray-50 dark:bg-dark-bg hover:bg-gray-100 dark:hover:bg-dark-border rounded-full flex items-center justify-center text-gray-400 transition-colors" title="Search Messages">
            <FiSearch size={18} />
          </button>
        )}
      </div>

      <div className={`flex-1 overflow-y-auto px-4 pb-20 md:pb-4 space-y-1 custom-scrollbar ${messagesSidebarCollapsed ? 'px-2' : ''}`}>
        {chats.map((chat, idx) => {
          const chatName = chat.isGroupChat ? chat.chatName : chat.users.find(u => u._id !== user._id)?.username;
          const chatPic = chat.isGroupChat ? 'https://icon-library.com/images/group-icon/group-icon-13.jpg' : chat.users.find(u => u._id !== user._id)?.profilePicture;
          const isActive = activeChat?._id === chat._id;
          
          return (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={chat._id} 
              onClick={() => handleChatSelect(chat)}
              className={`flex items-center rounded-2xl cursor-pointer transition-all duration-200 group relative ${
                messagesSidebarCollapsed ? 'justify-center p-2' : 'p-3'
              } ${isActive ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-dark-bg'}`}
            >
              <div className="relative flex-shrink-0">
                {chatPic ? (
                  <img referrerPolicy="no-referrer" src={chatPic} alt="avatar" className="w-14 h-14 rounded-full object-cover shadow-sm" />
                ) : (
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm">
                    {chatName?.[0]?.toUpperCase()}
                  </div>
                )}
                {!chat.isGroupChat && (
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-dark-card rounded-full"></div>
                )}
              </div>
              
              {!messagesSidebarCollapsed && (
                <div className="ml-4 flex-1 overflow-hidden">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className={`font-semibold text-base truncate ${isActive ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-gray-100'}`}>
                      {chatName}
                    </h3>
                    <span className={`text-xs font-medium whitespace-nowrap ml-2 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>
                      {chat.latestMessage ? format(new Date(chat.latestMessage.updatedAt), 'HH:mm') : ''}
                    </span>
                  </div>
                  <p className={`text-sm truncate ${isActive ? 'text-blue-600/80 dark:text-blue-300/80' : 'text-gray-500 dark:text-gray-400'}`}>
                    {chat.latestMessage 
                      ? (chat.latestMessage.content 
                        ? chat.latestMessage.content 
                        : (chat.latestMessage.attachments && chat.latestMessage.attachments.length > 0 
                          ? `[${chat.latestMessage.attachments[0].type.charAt(0).toUpperCase() + chat.latestMessage.attachments[0].type.slice(1)}]`
                          : (chat.latestMessage.mediaUrl && chat.latestMessage.mediaType !== 'none'
                            ? `[${chat.latestMessage.mediaType.charAt(0).toUpperCase() + chat.latestMessage.mediaType.slice(1)}]`
                            : 'Say hi! 👋'
                          )
                        )
                      )
                      : 'Say hi! 👋'
                    }
                  </p>
                </div>
              )}

              {/* Collapsed State Hover Tooltip */}
              {messagesSidebarCollapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 whitespace-nowrap z-50">
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
