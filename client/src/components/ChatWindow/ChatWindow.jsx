import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
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
  FiInfo,
  FiChevronDown,
} from "react-icons/fi";
import MessageBubble from "../MessageBubble/MessageBubble";
import { getSocket } from "../../socket/socketClient";
import api from "../../services/api";
import toast from "react-hot-toast";
import { addMessage, setActiveChat } from "../../redux/slices/chatSlice";
import { toggleProfileSidebar } from "../../redux/slices/uiSlice";
import EmojiPicker from "emoji-picker-react";
import PigeonLogo from "../Logo";

const ChatWindow = ({ isTyping }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { activeChat, messages } = useSelector((state) => state.chat);
  const { theme } = useSelector((state) => state.ui);

  const [newMessage, setNewMessage] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef();

  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const messageContainerRef = useRef(null);

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
      fileInputRef.current.value = "";
    }
  };

  // Close emoji picker on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target) &&
        (!smileButtonRef.current ||
          !smileButtonRef.current.contains(event.target))
      ) {
        setEmojiPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Monitor scroll height to toggle scroll-to-bottom button
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    setShowScrollBottom(scrollHeight - scrollTop - clientHeight > 300);
  };

  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleFileSelect = (e) => {
    if (uploading || isRecording) {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    let mediaType = "file";
    if (file.type.startsWith("image/")) mediaType = "image";
    else if (file.type.startsWith("video/")) mediaType = "video";
    else if (file.type.startsWith("audio/")) mediaType = "audio";

    setSelectedFile({
      file,
      name: file.name,
      size: file.size,
      type: mediaType,
      previewUrl:
        mediaType === "image" || mediaType === "video"
          ? URL.createObjectURL(file)
          : null,
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

    let mediaType = "file";
    if (file.type.startsWith("image/")) mediaType = "image";
    else if (file.type.startsWith("video/")) mediaType = "video";
    else if (file.type.startsWith("audio/")) mediaType = "audio";

    setSelectedFile({
      file,
      name: file.name,
      size: file.size,
      type: mediaType,
      previewUrl:
        mediaType === "image" || mediaType === "video"
          ? URL.createObjectURL(file)
          : null,
    });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      recordingCancelledRef.current = false;

      let options = {};
      if (MediaRecorder.isTypeSupported("audio/webm")) {
        options = { mimeType: "audio/webm" };
      } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
        options = { mimeType: "audio/mp4" };
      }

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());

        if (recordingCancelledRef.current) {
          toast.error("Voice message discarded");
          return;
        }

        if (audioChunksRef.current.length === 0) return;

        const audioBlob = new Blob(audioChunksRef.current, {
          type: options.mimeType || "audio/webm",
        });
        const audioFile = new File(
          [audioBlob],
          `voice-message.${options.mimeType?.split("/")[1] || "webm"}`,
          { type: options.mimeType || "audio/webm" },
        );

        const formData = new FormData();
        formData.append("file", audioFile);

        const toastId = toast.loading("Sending voice message...");
        try {
          const { data } = await api.post("/chat/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });

          const socket = getSocket();
          const currentActiveChatId = activeChatIdRef.current;
          if (!socket || !currentActiveChatId) {
            toast.dismiss(toastId);
            return;
          }

          const messageData = {
            chatId: currentActiveChatId,
            mediaUrl: data.url,
            mediaType: "audio",
            content: "Voice Message 🎙️",
            attachments: [
              {
                url: data.url,
                type: "audio",
                fileName: "voice-message.webm",
              },
            ],
          };

          const response = await api.post("/message", messageData);
          dispatch(addMessage(response.data));
          socket.emit("new message", response.data);
          toast.success("Voice note sent!", { id: toastId });
        } catch (err) {
          toast.error("Failed to send voice message", { id: toastId });
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      toast.error("Microphone access denied");
    }
  };

  const cancelRecording = () => {
    recordingCancelledRef.current = true;
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    clearInterval(recordingTimerRef.current);
    setIsRecording(false);
    setRecordingTime(0);
  };

  const stopAndSendRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    clearInterval(recordingTimerRef.current);
    setIsRecording(false);
    setRecordingTime(0);
  };

  const formatRecordingTime = (secs) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    const socket = getSocket();
    if (!socket || !activeChat) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", activeChat._id);
    }

    let lastTypingTime = new Date().getTime();
    const timerLength = 3000;

    setTimeout(() => {
      const timeNow = new Date().getTime();
      const timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", activeChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  const handleSend = async (e) => {
    if (e.type === "keydown" && e.key !== "Enter") return;
    if (isSendingRef.current) return;

    const hasContent = newMessage.trim().length > 0;
    if (!hasContent && !selectedFile) return;

    try {
      isSendingRef.current = true;
      let uploadedAttachment = null;
      let toastId = null;

      if (selectedFile) {
        toastId = toast.loading(`Uploading ${selectedFile.name}...`);
        setUploading(true);
        setUploadProgress(0);

        const formData = new FormData();
        formData.append("file", selectedFile.file);

        const { data } = await api.post("/chat/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            setUploadProgress(percentCompleted);
          },
        });

        uploadedAttachment = {
          url: data.url,
          type: selectedFile.type,
          fileName: selectedFile.name,
        };

        toast.success("Upload complete!", { id: toastId });
        setUploading(false);
        clearSelectedFile();
      }

      const socket = getSocket();
      const currentActiveChatId = activeChatIdRef.current;
      if (!socket || !currentActiveChatId) return;

      const messagePayload = {
        chatId: currentActiveChatId,
        content: newMessage.trim(),
        attachments: uploadedAttachment ? [uploadedAttachment] : [],
      };

      const { data } = await api.post("/message", messagePayload);

      socket.emit("stop typing", currentActiveChatId);
      setTyping(false);
      setNewMessage("");
      dispatch(addMessage(data));
      socket.emit("new message", data);
    } catch (err) {
      toast.error("Failed to send message");
    } finally {
      isSendingRef.current = false;
      setUploading(false);
    }
  };

  const startCall = (type) => {
    const otherUser = activeChat?.users.find((u) => u._id !== user._id);
    if (!otherUser) return toast.error("Receiver not resolved");

    const event = new CustomEvent("initiate-call", {
      detail: { otherUser, type },
    });
    window.dispatchEvent(event);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  if (!activeChat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-white via-blue-50/10 to-blue-100/20 dark:from-[#0a0f1c] dark:via-[#0c1226] dark:to-[#0f172a] relative overflow-hidden">
        {/* Futuristic Background Mesh Grid & Blob Lights */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:40px_40px] z-0" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] animate-blob-slow" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] animate-blob-slower" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col items-center z-10 px-6"
        >
          {/* Futuristic Startup Circular Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", bounce: 0.4, delay: 0.1 }}
            className="w-24 h-24 bg-slate-200/50 dark:bg-white/5 border border-slate-300/30 dark:border-white/10 rounded-[2.5rem] flex items-center justify-center shadow-2xl relative mb-8 backdrop-blur-xl group hover:border-slate-350/50 dark:hover:border-white/20 transition-all duration-300"
          >
            <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-blue-500 to-indigo-600 opacity-10 dark:opacity-20 blur-md group-hover:opacity-30 dark:group-hover:opacity-40 transition-opacity" />
            <PigeonLogo
              className="w-12 h-12 relative z-10"
              variant="gradient"
            />
          </motion.div>

          {/* End-to-End Encrypted Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="flex items-center gap-2 bg-slate-200/50 dark:bg-white/5 border border-slate-300/20 dark:border-white/5 text-slate-500 dark:text-gray-400 px-4 py-2 rounded-full mb-6 shadow-md dark:shadow-lg backdrop-blur-md"
          >
            <FiLock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-450 animate-pulse" />
            <span className="text-[10px] font-black tracking-widest uppercase text-slate-500 dark:text-gray-400">
              End-to-End Encrypted
            </span>
          </motion.div>

          {/* Welcome Text */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="text-3xl md:text-4xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-slate-805 to-slate-700 dark:from-white dark:to-gray-400 bg-clip-text text-transparent mb-3 text-center"
          >
            Welcome to Pigeon Terminal
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="text-center text-slate-500 dark:text-gray-400 max-w-sm mb-8 leading-relaxed text-sm font-semibold"
          >
            A premium real-time communications workspace. Choose an active
            transmission or start a new message to begin.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="flex items-center gap-4.5"
          >
            <button className="flex items-center gap-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-bold py-3.5 px-7 rounded-2xl shadow-xl shadow-blue-500/20 dark:shadow-blue-500/25 transition-all duration-200 active:scale-95 text-sm tracking-wide">
              <FiEdit className="w-4 h-4" />
              <span>Start New Transmission</span>
            </button>
            <button className="flex items-center gap-2.5 bg-slate-200/50 hover:bg-slate-200 text-slate-700 dark:bg-white/5 dark:hover:bg-white/10 dark:text-white font-bold py-3.5 px-7 rounded-2xl border border-slate-300/20 dark:border-white/5 shadow-md dark:shadow-lg transition-all duration-200 active:scale-95 text-sm tracking-wide">
              <FiUsers className="w-4 h-4" />
              <span>Join a Channel</span>
            </button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  const chatName = activeChat.isGroupChat
    ? activeChat.chatName
    : activeChat.users.find((u) => u._id !== user._id)?.username;
  const chatPic = activeChat.isGroupChat
    ? null
    : activeChat.users.find((u) => u._id !== user._id)?.profilePicture;

  return (
    <div
      className="flex-1 flex flex-col bg-[#0b1020]/30 relative h-full backdrop-blur-3xl overflow-hidden"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Background grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff01_1px,transparent_1px),linear-gradient(to_bottom,#ffffff01_1px,transparent_1px)] bg-[size:40px_40px] z-0 pointer-events-none" />

      {isDragging && (
        <div className="absolute inset-0 bg-blue-500/10 backdrop-blur-[2px] border border-dashed border-blue-500/30 rounded-3xl m-4 flex flex-col items-center justify-center z-50 pointer-events-none m-6">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#111827]/80 backdrop-blur-md p-7 rounded-3xl shadow-2xl border border-white/5 flex flex-col items-center gap-3.5"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shadow-inner">
              <FiPaperclip size={22} className="animate-bounce" />
            </div>
            <p className="font-bold text-white">
              Drop your file here to attach
            </p>
            <p className="text-xs text-gray-500">
              Supports images, videos, audio, and documents
            </p>
          </motion.div>
        </div>
      )}

      {/* Floating Glass Header */}
      <div className="h-20 border-b border-white/5 px-4 md:px-8 flex items-center justify-between bg-[#111827]/40 dark:bg-[#0c1226]/40 backdrop-blur-md sticky top-0 z-20 shadow-sm select-none">
        <div className="flex items-center gap-2 md:gap-4 min-w-0">
          {/* Back button for mobile */}
          <button
            onClick={() => dispatch(setActiveChat(null))}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5 transition-all mr-1 shrink-0"
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
                <img
                  referrerPolicy="no-referrer"
                  src={chatPic}
                  alt="avatar"
                  className="w-11 h-11 md:w-12 md:h-12 rounded-full object-cover shadow-md border border-white/10"
                />
              ) : (
                <div className="w-11 h-11 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md border border-white/10">
                  {chatName?.[0]?.toUpperCase()}
                </div>
              )}
              {/* Pulsing online indicator */}
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-[#111827] rounded-full">
                <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75" />
              </div>
            </div>
            <div className="flex flex-col min-w-0 text-left">
              <h3 className="font-bold text-base md:text-lg text-white leading-tight truncate">
                {chatName}
              </h3>
              <span className="text-xs md:text-sm font-bold text-blue-400 h-4 md:h-5 mt-0.5 truncate tracking-wide">
                {isTyping ? "typing..." : "Online"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 md:gap-2 shrink-0">
          <button
            onClick={() => startCall("audio")}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 hover:text-blue-400 hover:bg-white/5 border border-transparent hover:border-white/5 transition-all"
            title="Start Audio Call"
          >
            <FiPhone size={19} />
          </button>
          <button
            onClick={() => startCall("video")}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 hover:text-indigo-400 hover:bg-white/5 border border-transparent hover:border-white/5 transition-all"
            title="Start Video Call"
          >
            <FiVideo size={19} />
          </button>
          <button
            onClick={() => dispatch(toggleProfileSidebar())}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 hover:text-purple-400 hover:bg-white/5 border border-transparent hover:border-white/5 transition-all"
            title="Toggle Profile Info"
          >
            <FiInfo size={19} />
          </button>
          <div className="w-px h-6 bg-white/5 mx-1 md:mx-2"></div>
          <button
            className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5 transition-all"
            title="More Options"
          >
            <FiMoreVertical size={19} />
          </button>
        </div>
      </div>

      {/* Messages thread container */}
      <div
        ref={messageContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col custom-scrollbar relative z-10"
      >
        {messages.map((m) => (
          <MessageBubble key={m._id} message={m} />
        ))}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-gray-400 ml-12 mb-4"
          >
            <div className="flex gap-1.5 bg-white/5 py-3 px-4 rounded-2xl rounded-tl-sm border border-white/5 shadow-sm backdrop-blur-md">
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                className="w-1.5 h-1.5 bg-blue-400 rounded-full"
              />
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                className="w-1.5 h-1.5 bg-blue-400 rounded-full"
              />
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                className="w-1.5 h-1.5 bg-blue-400 rounded-full"
              />
            </div>
          </motion.div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Floating Scroll to bottom button */}
      <AnimatePresence>
        {showScrollBottom && (
          <motion.button
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            onClick={scrollToBottom}
            className="absolute bottom-28 right-8 w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 z-30 active:scale-95 transition-all border border-white/10"
            title="Scroll to bottom"
          >
            <FiChevronDown size={18} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Floating Glassmorphic Input capsule */}
      <div className="p-4 md:p-6 bg-transparent relative z-10 max-w-5xl w-full mx-auto pb-6">
        <div className="bg-[#111827]/40 border border-white/5 backdrop-blur-xl rounded-[2.2rem] p-3 shadow-2xl transition-all focus-within:ring-2 focus-within:ring-indigo-500/20 relative">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileSelect}
          />

          {emojiPickerOpen && (
            <div
              ref={emojiPickerRef}
              className="absolute bottom-24 left-4 z-50 shadow-2xl rounded-3xl overflow-hidden border border-white/5"
            >
              <EmojiPicker
                onEmojiClick={(emojiData) => {
                  setNewMessage((prev) => prev + emojiData.emoji);
                }}
                theme="dark"
              />
            </div>
          )}

          {selectedFile && (
            <div className="mb-3 bg-[#0a0f1c]/80 backdrop-blur-md border border-white/5 rounded-2xl p-4 flex flex-col shadow-lg relative animate-fade-in text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  {selectedFile.previewUrl ? (
                    selectedFile.type === "image" ? (
                      <img
                        referrerPolicy="no-referrer"
                        src={selectedFile.previewUrl}
                        alt="Preview"
                        className="w-14 h-14 object-cover rounded-xl border border-white/10 shrink-0"
                      />
                    ) : (
                      <video
                        src={selectedFile.previewUrl}
                        className="w-14 h-14 object-cover rounded-xl border border-white/10 shrink-0 bg-black"
                      />
                    )
                  ) : (
                    <div className="w-14 h-14 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center shrink-0">
                      <FiFile size={24} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate pr-2">
                      {selectedFile.name}
                    </p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase mt-0.5">
                      {(selectedFile.size / 1024).toFixed(1)} KB •{" "}
                      {selectedFile.type}
                    </p>
                  </div>
                </div>

                <button
                  onClick={clearSelectedFile}
                  disabled={uploading}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/5 text-gray-400 hover:text-white transition-colors disabled:opacity-50 shrink-0"
                >
                  <FiX size={16} />
                </button>
              </div>

              {uploading && (
                <div className="mt-3">
                  <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase mb-1">
                    <span>Uploading transmission...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 h-full transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex items-end gap-2.5">
            {/* Attachment Button */}
            <button
              onClick={() => {
                if (!fileInputRef.current) return;
                fileInputRef.current.value = "";
                fileInputRef.current.click();
              }}
              disabled={uploading || isRecording}
              className="flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiPaperclip size={20} />
            </button>

            {isRecording ? (
              <div className="flex-1 bg-red-950/20 rounded-2xl flex items-center px-4 py-2 border border-red-900/30 justify-between animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
                  <span className="text-xs font-bold text-red-400 uppercase tracking-widest">
                    Recording Note
                  </span>
                  <span className="text-xs font-semibold text-red-400 font-mono ml-2">
                    {formatRecordingTime(recordingTime)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={cancelRecording}
                    className="p-2 text-red-400 hover:bg-red-900/40 rounded-xl transition-all"
                    title="Discard Recording"
                  >
                    <FiTrash2 size={18} />
                  </button>
                  <button
                    onClick={stopAndSendRecording}
                    className="w-10 h-10 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-lg shadow-red-500/25 transition-all transform hover:scale-105 active:scale-95 animate-bounce"
                    title="Send Voice Message"
                  >
                    <FiSend size={16} className="ml-0.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 bg-[#0b1020]/40 rounded-2xl flex items-center px-2 py-0.5 border border-white/5 transition-all focus-within:border-indigo-500/30">
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
                  placeholder={
                    selectedFile ? "Add a caption..." : "Type a message..."
                  }
                  className="flex-1 bg-transparent border-none focus:outline-none text-white py-3 px-2 text-sm placeholder-gray-500 font-medium font-sans"
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
              disabled={
                (!newMessage.trim() && !selectedFile) ||
                isRecording ||
                uploading
              }
              className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full transition-all shadow-lg ${
                (newMessage.trim() || selectedFile) && !uploading
                  ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-blue-500/20 hover:shadow-xl hover:scale-105 active:scale-95"
                  : "bg-white/5 text-gray-500 border border-white/5 cursor-not-allowed"
              }`}
            >
              <FiSend
                size={20}
                className={newMessage.trim() || selectedFile ? "ml-1" : ""}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
