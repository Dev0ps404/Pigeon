import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  FiPhone, 
  FiVideo, 
  FiMoreVertical, 
  FiPaperclip, 
  FiSmile, 
  FiMic, 
  FiSend,
  FiLock,
  FiHeart,
  FiMessageCircle,
  FiEdit,
  FiUsers,
  FiTrash2,
  FiFile,
  FiX,
  FiArrowLeft,
  FiInfo
} from 'react-icons/fi';
import MessageBubble from '../MessageBubble/MessageBubble';
import { getSocket } from '../../socket/socketClient';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { addMessage, setActiveChat } from '../../redux/slices/chatSlice';
import { toggleProfileSidebar } from '../../redux/slices/uiSlice';
import EmojiPicker from 'emoji-picker-react';


const ChatWindow = ({ isTyping }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { activeChat, messages } = useSelector((state) => state.chat);
  const { theme } = useSelector((state) => state.ui);
  
  const [newMessage, setNewMessage] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef();

  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  // Voice Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const fileInputRef = useRef();
  const emojiPickerRef = useRef();
  const smileButtonRef = useRef();
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const recordingCancelledRef = useRef(false);

  const activeChatIdRef = useRef(activeChat?._id);
  useEffect(() => {
    activeChatIdRef.current = activeChat?._id;
  }, [activeChat]);

  const isSendingRef = useRef(false);

  // Clean up selectedFile previewUrl when changing selectedFile or unmounting to prevent leaks/stale caching
  useEffect(() => {
    let currentPreviewUrl = selectedFile?.previewUrl;
    return () => {
      if (currentPreviewUrl) {
        URL.revokeObjectURL(currentPreviewUrl);
      }
    };
  }, [selectedFile?.previewUrl]);

  const clearSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Close emoji picker on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current && 
        !emojiPickerRef.current.contains(event.target) &&
        (!smileButtonRef.current || !smileButtonRef.current.contains(event.target))
      ) {
        setEmojiPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFileSelect = (e) => {
    if (uploading || isRecording) {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    let mediaType = 'file';
    if (file.type.startsWith('image/')) mediaType = 'image';
    else if (file.type.startsWith('video/')) mediaType = 'video';
    else if (file.type.startsWith('audio/')) mediaType = 'audio';

    setSelectedFile({
      file,
      name: file.name,
      size: file.size,
      type: mediaType,
      previewUrl: (mediaType === 'image' || mediaType === 'video') ? URL.createObjectURL(file) : null,
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!uploading && !isRecording) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (uploading || isRecording) return;

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    let mediaType = 'file';
    if (file.type.startsWith('image/')) mediaType = 'image';
    else if (file.type.startsWith('video/')) mediaType = 'video';
    else if (file.type.startsWith('audio/')) mediaType = 'audio';

    setSelectedFile({
      file,
      name: file.name,
      size: file.size,
      type: mediaType,
      previewUrl: (mediaType === 'image' || mediaType === 'video') ? URL.createObjectURL(file) : null,
    });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      recordingCancelledRef.current = false;

      let options = {};
      if (MediaRecorder.isTypeSupported('audio/webm')) {
        options = { mimeType: 'audio/webm' };
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        options = { mimeType: 'audio/mp4' };
      }

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());

        if (recordingCancelledRef.current) {
          toast.error('Voice message discarded');
          return;
        }

        if (audioChunksRef.current.length === 0) return;

        const audioBlob = new Blob(audioChunksRef.current, { type: options.mimeType || 'audio/webm' });
        const audioFile = new File([audioBlob], `voice-message.${options.mimeType?.split('/')[1] || 'webm'}`, { type: options.mimeType || 'audio/webm' });

        const formData = new FormData();
        formData.append('file', audioFile);

        const toastId = toast.loading('Sending voice message...');

        try {
          const { data: uploadData } = await api.post('/upload', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          const attachmentObj = {
            url: uploadData.url,
            public_id: uploadData.public_id || 'local',
            type: 'audio',
            fileName: uploadData.name || audioFile.name,
            size: uploadData.size || audioFile.size,
          };

          const { data: messageData } = await api.post('/message', {
            content: 'Voice Message 🎙️',
            chatId: activeChat._id,
            mediaUrl: uploadData.url,
            mediaType: 'audio',
            attachments: [attachmentObj],
          });

          dispatch(addMessage(messageData));
          
          const socket = getSocket();
          socket?.emit('new message', messageData);

          toast.success('Voice message sent!', { id: toastId });
        } catch (error) {
          console.error(error);
          toast.error('Failed to send voice message', { id: toastId });
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

    } catch (error) {
      console.error(error);
      toast.error('Microphone permission denied or unsupported');
    }
  };

  const stopAndSendRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    clearInterval(recordingTimerRef.current);
    setIsRecording(false);
    setRecordingTime(0);
  };

  const cancelRecording = () => {
    recordingCancelledRef.current = true;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    clearInterval(recordingTimerRef.current);
    setIsRecording(false);
    setRecordingTime(0);
  };

  const formatRecordingTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const startCall = (type) => {
    if (!activeChat || activeChat.isGroupChat) {
      toast.error('Direct calls are only supported in 1-on-1 chats currently');
      return;
    }
    const otherUser = activeChat.users.find((u) => u._id !== user._id);
    if (!otherUser) {
      toast.error('Participant not found');
      return;
    }
    window.dispatchEvent(
      new CustomEvent('initiate-call', {
        detail: { otherUser, type },
      })
    );
  };

  const handleSend = async (e) => {
    if (e && e.key && e.key !== 'Enter') return;
    if (isSendingRef.current) return;
    
    const isTextEmpty = !newMessage.trim();
    if (isTextEmpty && !selectedFile) return;
    if (isRecording) return;

    const targetChatId = activeChat._id;
    const fileToSend = selectedFile;

    const socket = getSocket();
    socket?.emit('stop typing', targetChatId);

    isSendingRef.current = true;
    setUploading(true);

    let toastId = null;
    try {
      let attachmentObj = null;
      let mediaType = 'none';
      let mediaUrl = '';

      if (fileToSend) {
        toastId = toast.loading(`Uploading "${fileToSend.name}"...`);
        const formData = new FormData();
        formData.append('file', fileToSend.file);

        const { data: uploadData } = await api.post('/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        });

        mediaType = fileToSend.type;
        mediaUrl = uploadData.url;
        attachmentObj = {
          id: uploadData.public_id || 'att-' + Date.now() + '-' + Math.round(Math.random() * 1e9),
          url: uploadData.url,
          public_id: uploadData.public_id || 'local',
          type: uploadData.type || mediaType,
          fileName: uploadData.name || fileToSend.name,
          size: uploadData.size || fileToSend.size,
        };
      }

      const messageContent = newMessage.trim();

      const { data: messageData } = await api.post('/message', {
        content: messageContent,
        chatId: targetChatId,
        mediaUrl: mediaUrl,
        mediaType: mediaType,
        attachments: attachmentObj ? [attachmentObj] : [],
      });

      if (activeChatIdRef.current === targetChatId) {
        setNewMessage('');
        clearSelectedFile();
        setUploadProgress(0);
        dispatch(addMessage(messageData));
        socket?.emit('new message', messageData);

        if (toastId) {
          toast.success('Message sent!', { id: toastId });
        }
      } else {
        clearSelectedFile();
        setUploadProgress(0);
        socket?.emit('new message', messageData);

        if (toastId) {
          toast.success('Message sent to previous chat!', { id: toastId });
        }
      }
    } catch (error) {
      console.error(error);
      const errMsg = error.response?.data?.message || 'Failed to send message';
      if (toastId) {
        toast.error(errMsg, { id: toastId });
      } else {
        toast.error(errMsg);
      }
    } finally {
      isSendingRef.current = false;
      setUploading(false);
    }
  };

  const typingHandler = (e) => {
    setNewMessage(e.target.value);
    const socket = getSocket();
    if (!socket) return;

    if (!typing) {
      setTyping(true);
      socket.emit('typing', activeChat._id);
    }
    
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit('stop typing', activeChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  if (!activeChat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-white via-blue-50/30 to-blue-100/40 dark:from-[#0a0f1c] dark:via-[#0d1426] dark:to-[#111b33] relative overflow-hidden">
        {/* Subtle background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-72 h-72 bg-blue-200/20 dark:bg-blue-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-indigo-200/20 dark:bg-indigo-500/5 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="flex flex-col items-center z-10 px-6"
        >
          {/* Illustration Card */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', bounce: 0.4, delay: 0.1 }}
            className="relative w-48 h-48 md:w-56 md:h-56 mb-8"
          >
            {/* Main card background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100 dark:from-blue-900/30 dark:via-indigo-900/20 dark:to-purple-900/30 rounded-3xl shadow-lg shadow-blue-200/40 dark:shadow-blue-900/20 border border-white/60 dark:border-white/5" />
            
            {/* Floating Send/Play Icon - center */}
            <motion.div
              animate={{ y: [-4, 4, -4] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/30"
            >
              <FiSend className="text-white w-7 h-7 md:w-9 md:h-9 ml-1" />
            </motion.div>

            {/* Floating Chat Bubble - top right */}
            <motion.div
              animate={{ y: [-6, 2, -6], x: [0, 3, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut', delay: 0.5 }}
              className="absolute top-3 right-3 md:top-4 md:right-4 w-11 h-11 md:w-13 md:h-13 bg-white dark:bg-dark-card rounded-xl shadow-md flex items-center justify-center border border-gray-100 dark:border-dark-border"
            >
              <FiMessageCircle className="text-blue-500 w-5 h-5 md:w-6 md:h-6" />
            </motion.div>

            {/* Floating Heart - bottom left */}
            <motion.div
              animate={{ y: [3, -5, 3], x: [0, -2, 0] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut', delay: 1 }}
              className="absolute bottom-3 left-3 md:bottom-4 md:left-4 w-10 h-10 md:w-12 md:h-12 bg-white dark:bg-dark-card rounded-xl shadow-md flex items-center justify-center border border-gray-100 dark:border-dark-border"
            >
              <FiHeart className="text-pink-500 w-4 h-4 md:w-5 md:h-5" />
            </motion.div>

            {/* Small decorative dot - top left */}
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
              className="absolute top-6 left-6 w-3 h-3 bg-yellow-400 rounded-full shadow-sm"
            />
            
            {/* Small decorative dot - bottom right */}
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut', delay: 0.8 }}
              className="absolute bottom-6 right-6 w-2.5 h-2.5 bg-green-400 rounded-full shadow-sm"
            />
          </motion.div>

          {/* End-to-End Encrypted Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="flex items-center gap-2 bg-gray-900 dark:bg-gray-800 text-white px-4 py-2 rounded-full mb-5 shadow-md"
          >
            <FiLock className="w-3.5 h-3.5 text-green-400" />
            <span className="text-xs font-semibold tracking-wide uppercase">End-to-End Encrypted</span>
          </motion.div>

          {/* Welcome Text */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-3 text-center"
          >
            Welcome to Pigeon
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="text-center text-gray-500 dark:text-gray-400 max-w-md mb-8 leading-relaxed text-sm md:text-base"
          >
            Connecting you to your favorite people in real-time. Select a conversation from the list or start a new message to begin.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="flex items-center gap-3"
          >
            <button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
              <FiEdit className="w-4 h-4" />
              <span>Start New Chat</span>
            </button>
            <button className="flex items-center gap-2 bg-white dark:bg-dark-card hover:bg-gray-50 dark:hover:bg-dark-border text-gray-700 dark:text-gray-300 font-semibold px-6 py-3 rounded-xl border-2 border-gray-200 dark:border-dark-border hover:border-gray-300 dark:hover:border-gray-600 shadow-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
              <FiUsers className="w-4 h-4" />
              <span>Join a Group</span>
            </button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  const chatName = activeChat.isGroupChat ? activeChat.chatName : activeChat.users.find((u) => u._id !== user._id)?.username;
  const chatPic = activeChat.isGroupChat ? null : activeChat.users.find((u) => u._id !== user._id)?.profilePicture;

  return (
    <div 
      className="flex-1 flex flex-col bg-gray-50/30 dark:bg-[#0a0f1c] relative h-full"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div 
          className="absolute inset-0 bg-blue-500/10 dark:bg-blue-500/5 backdrop-blur-[2px] border-2 border-dashed border-blue-500 rounded-3xl m-4 flex flex-col items-center justify-center z-50 pointer-events-none"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-dark-border flex flex-col items-center gap-3"
          >
            <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner">
              <FiPaperclip size={22} className="animate-bounce" />
            </div>
            <p className="font-bold text-gray-800 dark:text-gray-200">Drop your file here to attach</p>
            <p className="text-xs text-gray-400">Supports images, videos, audio, and documents</p>
          </motion.div>
        </div>
      )}
      {/* Header */}
      <div className="h-20 border-b border-gray-100 dark:border-dark-border px-4 md:px-8 flex items-center justify-between bg-white/80 dark:bg-dark-card/80 backdrop-blur-md sticky top-0 z-10 shadow-sm select-none">
        <div className="flex items-center gap-2 md:gap-4 min-w-0">
          {/* Back button for mobile */}
          <button 
            onClick={() => dispatch(setActiveChat(null))}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-border transition-colors mr-1 shrink-0"
            title="Back to Chats"
          >
            <FiArrowLeft size={20} />
          </button>
          
          <div 
            onClick={() => dispatch(toggleProfileSidebar())}
            className="flex items-center gap-3 md:gap-4 cursor-pointer hover:opacity-90 transition-opacity min-w-0"
            title="View Profile / Info"
          >
            <div className="relative shrink-0">
              {chatPic ? (
                <img referrerPolicy="no-referrer" src={chatPic} alt="avatar" className="w-11 h-11 md:w-12 md:h-12 rounded-full object-cover shadow-sm" />
              ) : (
                <div className="w-11 h-11 md:w-12 md:h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm">
                   {chatName?.[0]?.toUpperCase()}
                </div>
              )}
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-dark-card rounded-full"></div>
            </div>
            <div className="flex flex-col min-w-0">
              <h3 className="font-bold text-base md:text-lg text-gray-900 dark:text-white leading-tight truncate">
                {chatName}
              </h3>
              <span className="text-xs md:text-sm font-medium text-blue-500 h-4 md:h-5 mt-0.5 truncate">
                {isTyping ? 'typing...' : 'Online'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1 md:gap-2 shrink-0">
          <button 
            onClick={() => startCall('audio')}
            className="w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            title="Start Audio Call"
          >
            <FiPhone size={19} />
          </button>
          <button 
            onClick={() => startCall('video')}
            className="w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
            title="Start Video Call"
          >
            <FiVideo size={19} />
          </button>
          <button 
            onClick={() => dispatch(toggleProfileSidebar())}
            className="w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            title="Toggle Profile Info"
          >
            <FiInfo size={19} />
          </button>
          <div className="w-px h-6 bg-gray-200 dark:bg-dark-border mx-1 md:mx-2"></div>
          <button className="w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-border transition-colors" title="More Options">
            <FiMoreVertical size={19} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col custom-scrollbar">
        {messages.map((m) => (
          <MessageBubble key={m._id} message={m} />
        ))}
        {isTyping && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-gray-400 ml-12 mb-4"
          >
            <div className="flex gap-1 bg-white dark:bg-dark-card py-3 px-4 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100 dark:border-dark-border">
              <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
              <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
              <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
            </div>
          </motion.div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div className="p-4 md:p-6 bg-white/80 dark:bg-dark-card/80 backdrop-blur-md border-t border-gray-100 dark:border-dark-border relative">
        {/* Hidden inputs and overlays */}
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleFileSelect} 
        />
        
        {emojiPickerOpen && (
          <div 
            ref={emojiPickerRef}
            className="absolute bottom-24 left-4 z-50 shadow-2xl rounded-2xl overflow-hidden border border-gray-100 dark:border-dark-border"
          >
            <EmojiPicker 
              onEmojiClick={(emojiData) => {
                setNewMessage((prev) => prev + emojiData.emoji);
              }}
              theme={theme === 'dark' || theme === 'cyberpunk' ? 'dark' : 'light'}
            />
          </div>
        )}

        {selectedFile && (
          <div className="max-w-5xl mx-auto mb-4 bg-white/70 dark:bg-[#0f172a]/70 backdrop-blur-md border border-gray-150/40 dark:border-slate-800/80 rounded-2xl p-4 flex flex-col shadow-lg relative animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                {selectedFile.previewUrl ? (
                  selectedFile.type === 'image' ? (
                    <img referrerPolicy="no-referrer" 
                      src={selectedFile.previewUrl} 
                      alt="Preview" 
                      className="w-14 h-14 object-cover rounded-xl border border-gray-200/50 dark:border-slate-800/80 shrink-0" 
                    />
                  ) : (
                    <video 
                      src={selectedFile.previewUrl} 
                      className="w-14 h-14 object-cover rounded-xl border border-gray-200/50 dark:border-slate-800/80 shrink-0 bg-black" 
                    />
                  )
                ) : (
                  <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center shrink-0">
                    <FiFile size={24} />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate pr-2">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs font-semibold text-gray-400 mt-0.5">
                    {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type.toUpperCase()}
                  </p>
                </div>
              </div>
              
              <button 
                onClick={clearSelectedFile}
                disabled={uploading}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-250 dark:bg-dark-bg dark:hover:bg-dark-border text-gray-500 dark:text-gray-400 transition-colors disabled:opacity-50 shrink-0"
              >
                <FiX size={16} />
              </button>
            </div>

            {uploading && (
              <div className="mt-3">
                <div className="flex justify-between text-xs font-bold text-gray-400 dark:text-slate-500 mb-1">
                  <span>Uploading file...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-150 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full transition-all duration-200" 
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex items-end gap-3 max-w-5xl mx-auto">
          {/* Attachment Paperclip Button */}
          <button 
            onClick={() => {
              if (!fileInputRef.current) return;
              fileInputRef.current.value = '';
              fileInputRef.current.click();
            }}
            disabled={uploading || isRecording}
            className="flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-full text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiPaperclip size={20} />
          </button>
          
          {isRecording ? (
            <div className="flex-1 bg-red-50/50 dark:bg-red-950/20 rounded-3xl flex items-center px-4 py-2 border border-red-100 dark:border-red-900/30 justify-between animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 bg-red-600 rounded-full animate-ping" />
                <span className="text-sm font-bold text-red-600 dark:text-red-400">Recording</span>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 font-mono ml-2">
                  {formatRecordingTime(recordingTime)}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={cancelRecording}
                  className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl transition-all"
                  title="Discard Recording"
                >
                  <FiTrash2 size={18} />
                </button>
                <button 
                  onClick={stopAndSendRecording}
                  className="w-10 h-10 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-md shadow-red-500/25 transition-all transform hover:scale-105 active:scale-95 animate-bounce"
                  title="Send Voice Message"
                >
                  <FiSend size={16} className="ml-0.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 bg-gray-100 dark:bg-dark-bg rounded-3xl flex items-center px-2 py-1 shadow-inner border border-transparent focus-within:border-blue-500/30 transition-all">
              {/* Emoji Picker Button */}
              <button 
                ref={smileButtonRef}
                onClick={() => setEmojiPickerOpen(!emojiPickerOpen)}
                className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full text-gray-400 hover:text-yellow-500 transition-colors"
              >
                <FiSmile size={20} />
              </button>
              
              <input 
                type="text" 
                placeholder={selectedFile ? "Add a caption..." : "Type a message..."}
                className="flex-1 bg-transparent border-none focus:outline-none text-gray-900 dark:text-gray-100 py-3 px-2"
                value={newMessage}
                onChange={typingHandler}
                onKeyDown={handleSend}
                disabled={uploading}
              />
              
              {/* Voice Recorder Button */}
              {!newMessage.trim() && !selectedFile && (
                <button 
                  onClick={startRecording}
                  className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full text-gray-400 hover:text-red-500 transition-colors"
                  title="Record Voice Message"
                >
                  <FiMic size={20} />
                </button>
              )}
            </div>
          )}
          
          <button 
            onClick={handleSend}
            disabled={(!newMessage.trim() && !selectedFile) || isRecording || uploading}
            className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full transition-all shadow-lg ${
              (newMessage.trim() || selectedFile) && !uploading
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/30 hover:shadow-xl hover:scale-105 active:scale-95' 
                : 'bg-gray-200 dark:bg-dark-border text-gray-400 cursor-not-allowed'
            }`}
          >
            <FiSend size={20} className={(newMessage.trim() || selectedFile) ? 'ml-1' : ''} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
