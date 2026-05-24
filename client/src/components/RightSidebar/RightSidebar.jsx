import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFile, FiImage, FiVideo, FiLink, FiChevronRight, FiMic, FiX } from 'react-icons/fi';
import { toggleProfileSidebar } from '../../redux/slices/uiSlice';

const RightSidebar = () => {
  const dispatch = useDispatch();
  const { activeChat, messages } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);
  const { profileSidebarExpanded, profileSidebarWidth } = useSelector((state) => state.ui);

  if (!activeChat) return null;

  const chatName = activeChat.isGroupChat ? activeChat.chatName : activeChat.users.find((u) => u._id !== user._id)?.username;
  const chatPic = activeChat.isGroupChat ? null : activeChat.users.find((u) => u._id !== user._id)?.profilePicture;
  const bio = activeChat.isGroupChat 
    ? `Created by ${activeChat.groupAdmin?.username || 'Group Admin'}` 
    : (activeChat.users.find((u) => u._id !== user._id)?.bio || "Hey there! I'm using Pigeon.");

  // Extract all media and file attachments from messages dynamically
  const sharedMedia = [];
  const allAttachments = [];

  messages.forEach((m) => {
    // 1. Process structured attachments
    if (m.attachments && m.attachments.length > 0) {
      m.attachments.forEach((att) => {
        if (att.type === 'image' || att.type === 'video') {
          sharedMedia.push({
            _id: m._id,
            attachmentId: att.id || att._id,
            mediaUrl: att.url,
            mediaType: att.type,
          });
        } else {
          allAttachments.push({
            id: att.id || att._id || Math.random().toString(),
            icon: att.type === 'audio' ? <FiMic size={16} /> : <FiFile size={16} />,
            name: att.fileName || att.url.split('/').pop() || 'Attachment File',
            size: att.type === 'audio' ? 'Voice Message' : 'Document File',
            url: att.url,
          });
        }
      });
    } 
    // 2. Backward compatibility fallback
    else if (m.mediaUrl && m.mediaType !== 'none') {
      if (m.mediaType === 'image' || m.mediaType === 'video') {
        sharedMedia.push({
          _id: m._id,
          attachmentId: m._id,
          mediaUrl: m.mediaUrl,
          mediaType: m.mediaType,
        });
      } else {
        allAttachments.push({
          id: m._id,
          icon: m.mediaType === 'audio' ? <FiMic size={16} /> : <FiFile size={16} />,
          name: m.mediaUrl.split('/').pop() || 'Attachment File',
          size: m.mediaType === 'audio' ? 'Voice Message' : 'Document File',
          url: m.mediaUrl,
        });
      }
    }

    // 3. Process links from content
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    if (m.content && urlPattern.test(m.content) && !m.mediaUrl && (!m.attachments || m.attachments.length === 0)) {
      const urls = m.content.match(urlPattern) || [];
      urls.forEach((primaryUrl, idx) => {
        let hostname = 'Link';
        try {
          hostname = new URL(primaryUrl).hostname;
        } catch (err) {
          hostname = primaryUrl;
        }
        allAttachments.push({
          id: `${m._id || 'link'}-${idx}`,
          icon: <FiLink size={16} />,
          name: hostname,
          size: 'Shared Link',
          url: primaryUrl,
        });
      });
    }
  });

  return (
    <AnimatePresence>
      {profileSidebarExpanded && (
        <>
          {/* Mobile Overlay backdrop to support outside click to close */}
          <div 
            className="md:hidden fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-[1px] z-20"
            onClick={() => dispatch(toggleProfileSidebar())}
          />
          <motion.div 
            initial={{ x: '100%', opacity: 0.9 }}
            animate={{ x: 0, opacity: 1, width: window.innerWidth < 768 ? '85vw' : profileSidebarWidth }}
            exit={{ x: '100%', opacity: 0.9 }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className="h-full flex flex-col bg-white dark:bg-dark-card border-l border-gray-100 dark:border-dark-border overflow-y-auto custom-scrollbar select-none z-30 shrink-0 fixed md:relative right-0 top-0 bottom-0 shadow-2xl md:shadow-none"
          >
            {/* Header Panel with Close button */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-dark-border sticky top-0 bg-white/90 dark:bg-dark-card/90 backdrop-blur-sm z-20">
              <span className="font-bold text-gray-800 dark:text-gray-200">
                {activeChat.isGroupChat ? 'Group Info' : 'User Profile'}
              </span>
              <button 
                onClick={() => dispatch(toggleProfileSidebar())}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 dark:bg-dark-bg hover:bg-gray-100 dark:hover:bg-dark-border text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                title="Close Profile Sidebar"
              >
                <FiX size={16} />
              </button>
            </div>

          <div className="flex flex-col items-center p-8 border-b border-gray-100 dark:border-dark-border">
            {chatPic ? (
              <img referrerPolicy="no-referrer" src={chatPic} alt="Profile" className="w-24 h-24 rounded-full object-cover shadow-lg border-4 border-white dark:border-dark-card" />
            ) : (
              <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-4xl shadow-lg border-4 border-white dark:border-dark-card">
                {chatName?.[0]?.toUpperCase()}
              </div>
            )}
            <h3 className="mt-4 text-xl font-bold text-gray-900 dark:text-white truncate max-w-full px-2">{chatName}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{activeChat.isGroupChat ? 'Group Chat' : 'Online'}</p>
            
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-4 text-center bg-gray-50/50 dark:bg-dark-bg/60 p-3 rounded-xl w-full leading-normal border border-gray-100 dark:border-slate-800">
              "{bio}"
            </p>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <h4 className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-4">Shared Media</h4>
              {sharedMedia.length === 0 ? (
                <div className="py-8 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 dark:border-slate-800/80 rounded-2xl bg-gray-50/20 dark:bg-slate-900/10">
                  <FiImage className="text-gray-300 dark:text-slate-700 w-8 h-8 mb-1.5" />
                  <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">No shared media</span>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {sharedMedia.slice(0, 6).map((m, idx) => (
                    <a 
                      href={m.mediaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      key={m.attachmentId || m._id || idx} 
                      className="aspect-square bg-gray-50 dark:bg-dark-bg rounded-xl overflow-hidden relative group cursor-pointer border border-gray-100 dark:border-slate-800"
                    >
                      {m.mediaType === 'image' ? (
                        <img referrerPolicy="no-referrer" src={m.mediaUrl} alt="media" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                      ) : (
                        <div className="w-full h-full bg-slate-900 dark:bg-slate-950 flex items-center justify-center text-blue-400">
                          <FiVideo size={20} />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                         {m.mediaType === 'image' ? <FiImage className="text-white" /> : <FiVideo className="text-white" />}
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h4 className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-4">Attachments & Links</h4>
              {allAttachments.length === 0 ? (
                <div className="py-8 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 dark:border-slate-800/80 rounded-2xl bg-gray-50/20 dark:bg-slate-900/10">
                  <FiFile className="text-gray-300 dark:text-slate-700 w-8 h-8 mb-1.5" />
                  <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">No attachments</span>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {allAttachments.slice(0, 6).map((item) => (
                    <AttachmentItem 
                      key={item.id} 
                      icon={item.icon} 
                      name={item.name} 
                      size={item.size} 
                      url={item.url}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const AttachmentItem = ({ icon, name, size, url }) => (
  <a 
    href={url}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-dark-bg/60 rounded-2xl border border-transparent hover:border-gray-100 dark:hover:border-slate-800 cursor-pointer transition-all group text-left"
  >
    <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center shrink-0">
      {icon}
    </div>
    <div className="ml-3 flex-1 overflow-hidden">
      <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{name}</p>
      <p className="text-[10px] text-gray-500 dark:text-slate-500 font-semibold mt-0.5">{size}</p>
    </div>
    <FiChevronRight className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
  </a>
);

export default RightSidebar;
