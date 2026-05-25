import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import {
  FiFile,
  FiDownload,
  FiMic,
  FiCornerUpLeft,
  FiEdit3,
  FiTrash2,
  FiShare2,
  FiCopy,
  FiMoreHorizontal,
  FiSmile,
  FiX,
} from "react-icons/fi";
import toast from "react-hot-toast";

// Reusable progressive loading component with shimmers & smooth animations
const ProgressiveImage = ({ src, alt, className, onClick }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative w-full h-full min-h-[160px] bg-slate-100 dark:bg-white/5 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-200/50 dark:border-white/5 shadow-inner">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-200/50 dark:bg-white/[0.03] animate-pulse">
          <div className="w-8 h-8 rounded-full border-[2.5px] border-sky-500 border-t-transparent animate-spin"></div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        referrerPolicy="no-referrer"
        onLoad={() => setLoaded(true)}
        onClick={onClick}
        className={`${className} transition-all duration-500 ${
          loaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      />
    </div>
  );
};

const MessageBubble = ({
  message,
  onReply,
  onEdit,
  onDelete,
  onReact,
  onForward,
}) => {
  const { user } = useSelector((state) => state.auth);
  const { activeChat } = useSelector((state) => state.chat);
  const isMine = message.sender._id === user._id;

  const getReceiptStatus = () => {
    if (!isMine || message.isDeleted) return "none";

    const seenBy = message.seenBy || [];
    const deliveredTo = message.deliveredTo || [];

    if (activeChat) {
      if (activeChat.isGroupChat) {
        const otherParticipantIds = activeChat.users
          ?.map((u) => (typeof u === "object" ? u._id : u))
          ?.filter((uId) => uId !== user._id) || [];

        if (otherParticipantIds.length === 0) return "sent";

        const hasEveryoneSeen = otherParticipantIds.every((uId) => seenBy.includes(uId));
        if (hasEveryoneSeen) return "seen";

        const hasEveryoneReceived = otherParticipantIds.every((uId) => deliveredTo.includes(uId));
        if (hasEveryoneReceived) return "delivered";

        return "sent";
      } else {
        const recipient = activeChat.users?.find((u) => u._id !== user._id);
        if (!recipient) return "sent";
        const recipientId = recipient._id;

        if (seenBy.includes(recipientId)) return "seen";
        if (deliveredTo.includes(recipientId)) return "delivered";
        return "sent";
      }
    }

    return "sent";
  };

  const renderReceipts = () => {
    const status = getReceiptStatus();
    if (status === "none") return null;

    if (status === "seen") {
      return (
        <div className="flex items-center text-sky-400 dark:text-blue-400 select-none" title="Seen">
          <svg
            className="w-3.5 h-3.5 animate-bounce-once"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M7 12l5 5L22 7M2 12l5 5L13 11" />
          </svg>
        </div>
      );
    }

    if (status === "delivered") {
      return (
        <div className="flex items-center text-slate-400 dark:text-slate-500 select-none" title="Delivered">
          <svg
            className="w-3.5 h-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M7 12l5 5L22 7M2 12l5 5L13 11" />
          </svg>
        </div>
      );
    }

    return (
      <div className="flex items-center text-slate-400 dark:text-slate-500 select-none" title="Sent">
        <svg
          className="w-3.5 h-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
    );
  };

  const [showMenu, setShowMenu] = useState(false);
  const [showEmojiSelector, setShowEmojiSelector] = useState(false);
  const [isEditingLocal, setIsEditingLocal] = useState(false);
  const [editText, setEditText] = useState(message.content || "");
  const [dragX, setDragX] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  const menuRef = useRef(null);
  const touchStartRef = useRef(null);

  const hasAttachments = message.attachments && message.attachments.length > 0;
  const primaryAttachment = hasAttachments ? message.attachments[0] : null;

  const isAutoGeneratedMediaMsg =
    (message.mediaUrl || hasAttachments) &&
    (message.content === "Voice Message 🎙️" ||
      message.content.startsWith("Shared a photo:") ||
      message.content.startsWith("Shared a video:") ||
      message.content.startsWith("Shared a voice note:") ||
      message.content.startsWith("Shared a file:"));

  const isImageOrVideoOnly =
    (hasAttachments
      ? primaryAttachment &&
        (primaryAttachment.type === "image" ||
          primaryAttachment.type === "video")
      : message.mediaUrl &&
        (message.mediaType === "image" || message.mediaType === "video")) &&
    (isAutoGeneratedMediaMsg || !message.content || !message.content.trim()) &&
    !message.isDeleted;

  // React to touch outside menu to close it
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
        setShowEmojiSelector(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Touch Swipe-to-Reply detection
  const handleTouchStart = (e) => {
    if (message.isDeleted) return;
    touchStartRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    if (!touchStartRef.current || message.isDeleted) return;
    const diffX = e.touches[0].clientX - touchStartRef.current;
    // Swipe right to reply (constrained to positive values)
    if (diffX > 0 && diffX < 90) {
      setDragX(diffX);
    }
  };

  const handleTouchEnd = () => {
    if (dragX > 55 && onReply) {
      onReply(message);
      toast.success(`Replying to ${message.sender.username || "message"}`);
    }
    setDragX(0);
    touchStartRef.current = null;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    toast.success("Message copied!");
    setShowMenu(false);
  };

  const handleSaveEdit = () => {
    if (!editText.trim()) return;
    if (editText.trim() === message.content) {
      setIsEditingLocal(false);
      return;
    }
    if (onEdit) {
      onEdit(message, editText.trim());
    }
    setIsEditingLocal(false);
  };

  const handleReactionSelect = (emoji) => {
    if (onReact) {
      onReact(message, emoji);
    }
    setShowMenu(false);
    setShowEmojiSelector(false);
  };

  const getReactionCounts = () => {
    if (!message.reactions || message.reactions.length === 0) return [];
    const counts = {};
    message.reactions.forEach((r) => {
      counts[r.emoji] = (counts[r.emoji] || 0) + 1;
    });
    return Object.entries(counts).map(([emoji, count]) => {
      const usersReacted = message.reactions
        .filter((r) => r.emoji === emoji)
        .map((r) => r.user?._id || r.user);
      const hasMyReaction = usersReacted.includes(user._id);
      return { emoji, count, hasMyReaction };
    });
  };

  const scrollToMessage = (msgId) => {
    const el = document.getElementById(`msg-${msgId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("animate-message-highlight");
      setTimeout(() => {
        el.classList.remove("animate-message-highlight");
      }, 2000);
    } else {
      toast.error("Original message not found in this thread");
    }
  };

  const quickEmojis = ["❤️", "👍", "😂", "😮", "😢", "🙏"];

  const renderMedia = () => {
    const attachments = hasAttachments
      ? message.attachments
      : message.mediaUrl
        ? [
            {
              url: message.mediaUrl,
              type: message.mediaType,
              fileName: message.content.split(": ").pop() || "File",
            },
          ]
        : [];

    if (attachments.length === 0) return null;

    return (
      <div className="flex flex-col gap-3 w-full">
        {attachments.map((attachment, index) => {
          const { url, type, fileName } = attachment;
          if (!url) return null;

          switch (type) {
            case "image":
              return (
                <div
                  key={
                    attachment.id ||
                    attachment._id ||
                    attachment.public_id ||
                    `att-${message._id}-${index}`
                  }
                  className="relative group overflow-hidden rounded-2xl cursor-pointer shadow-md hover:shadow-lg transition-all border border-slate-200/70 dark:border-white/5"
                  onClick={() => setLightboxOpen(true)}
                >
                  <ProgressiveImage
                    src={url}
                    alt={fileName || "Shared Attachment"}
                    className="max-w-xs md:max-w-md max-h-72 object-cover rounded-2xl transition-transform duration-300 group-hover:scale-[1.015]"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                    <span className="bg-black/60 text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-md select-none backdrop-blur-sm">
                      Click to Zoom
                    </span>
                  </div>
                </div>
              );
            case "video":
              return (
                <div
                  key={
                    attachment.id ||
                    attachment._id ||
                    attachment.public_id ||
                    `att-${message._id}-${index}`
                  }
                  className="relative overflow-hidden rounded-2xl shadow-md border border-slate-200/70 dark:border-white/5"
                >
                  <video
                    src={url}
                    controls
                    className="max-w-xs md:max-w-md max-h-80 rounded-2xl focus:outline-none bg-black"
                  />
                </div>
              );
            case "audio":
              return (
                <div
                  key={
                    attachment.id ||
                    attachment._id ||
                    attachment.public_id ||
                    `att-${message._id}-${index}`
                  }
                  className="flex flex-col gap-3 p-4 rounded-2xl bg-white/90 dark:bg-[#0c1226]/50 border border-slate-200/70 dark:border-white/5 min-w-[270px] max-w-xs select-none backdrop-blur-md"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 dark:text-red-400 flex items-center justify-center shrink-0">
                      <FiMic size={16} className="animate-pulse" />
                    </div>
                    <div className="flex flex-col min-w-0 text-left">
                      <span className="text-xs font-bold text-slate-800 dark:text-white">
                        Voice Note
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-gray-500 uppercase tracking-wider">
                        Audio Recording
                      </span>
                    </div>
                  </div>
                  <audio
                    src={url}
                    controls
                    className="w-full filter dark:invert text-slate-800 focus:outline-none"
                  />
                </div>
              );
            case "file":
            default:
              const fileDisplayName =
                fileName || url.split("/").pop() || "Attachment File";
              return (
                <a
                  key={
                    attachment.id ||
                    attachment._id ||
                    attachment.public_id ||
                    `att-${message._id}-${index}`
                  }
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-4 bg-white/90 dark:bg-[#0c1226]/40 border border-slate-200/70 dark:border-white/5 hover:bg-white hover:border-sky-400/40 dark:hover:bg-[#0c1226]/60 dark:hover:border-blue-500/30 rounded-2xl cursor-pointer transition-all min-w-[270px] max-w-xs select-none group text-left backdrop-blur-md"
                >
                  <div className="w-10 h-10 bg-sky-500/10 text-sky-600 dark:text-blue-400 rounded-xl flex items-center justify-center shrink-0">
                    <FiFile size={18} />
                  </div>
                  <div className="ml-3.5 flex-1 overflow-hidden">
                    <p className="text-xs font-bold text-slate-700 dark:text-gray-200 truncate group-hover:text-sky-600 dark:group-hover:text-blue-400 transition-colors">
                      {fileDisplayName}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-gray-500 font-bold uppercase tracking-wider mt-0.5">
                      Download File
                    </p>
                  </div>
                  <FiDownload
                    className="text-slate-400 group-hover:text-sky-600 dark:text-gray-400 dark:group-hover:text-blue-400 transition-colors ml-2 shrink-0"
                    size={16}
                  />
                </a>
              );
          }
        })}
      </div>
    );
  };

  const renderBubbleContent = () => {
    const hasMedia =
      (message.mediaUrl && message.mediaType !== "none") || hasAttachments;

    if (message.isDeleted) {
      return (
        <p className="text-[13px] leading-relaxed italic text-gray-400 dark:text-slate-500 flex items-center gap-1.5 select-none">
          <FiTrash2
            size={13}
            className="shrink-0 text-gray-400 dark:text-slate-500"
          />
          This message was deleted
        </p>
      );
    }

    if (isEditingLocal) {
      return (
        <div className="flex flex-col gap-2.5 min-w-[220px] py-1 text-left relative z-10">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full text-xs p-2.5 rounded-xl border border-white/20 bg-slate-900/60 text-white focus:outline-none focus:ring-1 focus:ring-sky-400 resize-none font-sans"
            rows={2}
            autoFocus
          />
          <div className="flex justify-end gap-2 text-[10px] font-extrabold uppercase tracking-widest">
            <button
              type="button"
              onClick={() => setIsEditingLocal(false)}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveEdit}
              className="px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors cursor-pointer"
            >
              Save
            </button>
          </div>
        </div>
      );
    }

    return (
      <div
        className={`flex flex-col gap-2 ${isMine ? "items-end" : "items-start"}`}
      >
        {/* Forwarded Header Indicator */}
        {message.isForwarded && (
          <div className="flex items-center gap-1 text-[9px] font-extrabold uppercase text-slate-400 dark:text-gray-500 tracking-wider mb-0.5 select-none">
            <FiShare2 size={9} />
            <span>Forwarded</span>
          </div>
        )}

        {/* Replied Quoted Message Box */}
        {message.repliedTo && (
          <div
            onClick={() =>
              scrollToMessage(message.repliedTo._id || message.repliedTo)
            }
            className="mb-1.5 p-2 rounded-xl border-l-3 border-sky-400 dark:border-blue-500 bg-slate-950/20 dark:bg-white/5 cursor-pointer text-left select-none overflow-hidden max-w-xs truncate w-full group/reply hover:bg-slate-950/30 transition-colors"
          >
            <p className="text-[10px] font-extrabold text-sky-400 dark:text-blue-400 uppercase tracking-wider mb-0.5">
              Replying to {message.repliedTo.sender?.username || "User"}
            </p>
            <p className="text-[11.5px] text-slate-500 dark:text-slate-350 truncate">
              {message.repliedTo.content ||
                (message.repliedTo.attachments?.length > 0
                  ? "Attachment 📎"
                  : "Attachment")}
            </p>
          </div>
        )}

        {hasMedia && renderMedia()}
        {!isAutoGeneratedMediaMsg && message.content && (
          <p className="text-[14.5px] leading-relaxed break-words text-left font-medium">
            {message.content}
          </p>
        )}
      </div>
    );
  };

  const reactionCounts = getReactionCounts();

  return (
    <>
      <motion.div
        id={`msg-${message._id}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ x: dragX }}
        initial={{ opacity: 0, y: 12, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3 }}
        className={`flex w-full ${isMine ? "justify-end" : "justify-start"} mb-4 relative group`}
      >
        {/* Touch drag indicator for mobile swipe-to-reply */}
        {dragX > 15 && (
          <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center text-sky-500 dark:text-blue-400 shrink-0 pointer-events-none transition-all">
            <FiCornerUpLeft
              size={18}
              className={
                dragX > 55 ? "scale-125 stroke-[3.5]" : "scale-100 stroke-[2]"
              }
            />
          </div>
        )}

        {!isMine && (
          <img
            referrerPolicy="no-referrer"
            src={
              message.sender.profilePicture ||
              "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
            }
            alt="avatar"
            className="w-9 h-9 rounded-full object-cover mr-3 self-end shadow-md border border-white/5 select-none"
          />
        )}

        <div
          className={`flex flex-col max-w-[75%] lg:max-w-[65%] ${isMine ? "items-end" : "items-start"} relative`}
        >
          {isImageOrVideoOnly ? (
            <div className="relative">
              {renderMedia()}

              {/* Out-of-bubble action trigger */}
              {!message.isDeleted && (
                <button
                  type="button"
                  onClick={() => setShowMenu(!showMenu)}
                  className="absolute top-2 right-2 bg-slate-950/60 hover:bg-slate-950/80 text-white rounded-full p-2.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md cursor-pointer border border-white/10 z-10"
                >
                  <FiMoreHorizontal size={14} />
                </button>
              )}
            </div>
          ) : (
            <div className="relative flex items-center">
              {/* Left Quick Action panel (Mine message) */}
              {isMine && !message.isDeleted && !isEditingLocal && (
                <div className="absolute right-full mr-2.5 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10 select-none">
                  <button
                    type="button"
                    onClick={() => onReply(message)}
                    className="w-8 h-8 rounded-full bg-white dark:bg-[#111827] border border-slate-200/70 dark:border-white/5 text-slate-500 dark:text-gray-400 hover:text-sky-500 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center justify-center shadow-sm cursor-pointer"
                    title="Reply"
                  >
                    <FiCornerUpLeft size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(true);
                      setShowEmojiSelector(true);
                    }}
                    className="w-8 h-8 rounded-full bg-white dark:bg-[#111827] border border-slate-200/70 dark:border-white/5 text-slate-500 dark:text-gray-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center justify-center shadow-sm cursor-pointer"
                    title="React with Emoji"
                  >
                    <FiSmile size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowMenu(!showMenu)}
                    className="w-8 h-8 rounded-full bg-white dark:bg-[#111827] border border-slate-200/70 dark:border-white/5 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 flex items-center justify-center shadow-sm cursor-pointer"
                    title="More actions"
                  >
                    <FiMoreHorizontal size={13} />
                  </button>
                </div>
              )}

              {/* Bubble Container */}
              <div
                className={`px-5 py-3.5 shadow-md relative group/bubble ${
                  message.isDeleted
                    ? "bg-gray-100 dark:bg-white/5 border border-slate-200/70 dark:border-white/5 rounded-2xl py-2.5 px-4"
                    : isMine
                      ? "bg-gradient-to-tr from-sky-600 via-blue-600 to-indigo-600 text-white rounded-2xl rounded-tr-sm border border-white/10"
                      : "bg-white/95 dark:bg-white/5 backdrop-blur-md text-slate-700 dark:text-gray-200 rounded-2xl rounded-tl-sm border border-slate-200/70 dark:border-white/5"
                }`}
              >
                {renderBubbleContent()}
              </div>

              {/* Right Quick Action panel (Incoming message) */}
              {!isMine && !message.isDeleted && !isEditingLocal && (
                <div className="absolute left-full ml-2.5 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10 select-none">
                  <button
                    type="button"
                    onClick={() => onReply(message)}
                    className="w-8 h-8 rounded-full bg-white dark:bg-[#111827] border border-slate-200/70 dark:border-white/5 text-slate-500 dark:text-gray-400 hover:text-sky-500 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center justify-center shadow-sm cursor-pointer"
                    title="Reply"
                  >
                    <FiCornerUpLeft size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(true);
                      setShowEmojiSelector(true);
                    }}
                    className="w-8 h-8 rounded-full bg-white dark:bg-[#111827] border border-slate-200/70 dark:border-white/5 text-slate-500 dark:text-gray-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center justify-center shadow-sm cursor-pointer"
                    title="React with Emoji"
                  >
                    <FiSmile size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowMenu(!showMenu)}
                    className="w-8 h-8 rounded-full bg-white dark:bg-[#111827] border border-slate-200/70 dark:border-white/5 text-slate-500 dark:text-gray-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 flex items-center justify-center shadow-sm cursor-pointer"
                    title="More actions"
                  >
                    <FiMoreHorizontal size={13} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Footer Metrics (Time, Reactions, Edited Tag) */}
          <div
            className={`flex flex-wrap gap-2 items-center mt-1.5 px-1.5 ${
              isMine ? "justify-end" : "justify-start"
            }`}
          >
            {/* Reaction Pills Overlay */}
            {reactionCounts.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-0.5 select-none">
                {reactionCounts.map(({ emoji, count, hasMyReaction }) => (
                  <button
                    type="button"
                    key={emoji}
                    onClick={() => onReact && onReact(message, emoji)}
                    className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold transition-all border cursor-pointer hover:scale-105 active:scale-95 ${
                      hasMyReaction
                        ? "bg-primary-500/15 border-primary-500/30 text-primary-650 dark:text-sky-400"
                        : "bg-white/90 dark:bg-white/5 border-slate-200/60 dark:border-white/5 text-slate-650 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-white/10"
                    }`}
                  >
                    <span>{emoji}</span>
                    <span className="text-[10px]">{count}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Edited Label */}
            {message.isEdited && !message.isDeleted && (
              <span className="text-[9.5px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider">
                Edited
              </span>
            )}

            {/* Time & Receipts */}
            <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wide">
              {format(new Date(message.createdAt), "hh:mm a")}
            </span>
            {renderReceipts()}
          </div>

          {/* ── Premium Context Menu Panel overlay ── */}
          <AnimatePresence>
            {showMenu && (
              <motion.div
                ref={menuRef}
                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                transition={{ duration: 0.15 }}
                className={`absolute z-40 bg-slate-950/95 dark:bg-[#0b1220]/95 border border-white/[0.1] backdrop-blur-xl p-1.5 rounded-2xl shadow-2xl flex flex-col min-w-[170px] select-none text-left ${
                  isMine ? "right-0 top-12" : "left-0 top-12"
                }`}
              >
                {/* Emoji quick reaction dock */}
                {showEmojiSelector && (
                  <div className="flex items-center justify-between border-b border-white/[0.1] pb-1.5 mb-1.5 px-1 pt-1 gap-1">
                    {quickEmojis.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleReactionSelect(emoji)}
                        type="button"
                        className="w-7 h-7 flex items-center justify-center text-sm rounded-lg hover:bg-white/10 active:scale-90 transition-all cursor-pointer"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}

                {/* Menu items */}
                <button
                  type="button"
                  onClick={() => {
                    onReply(message);
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-200 hover:text-white hover:bg-white/10 rounded-xl cursor-pointer transition-colors"
                >
                  <FiCornerUpLeft size={13} className="text-slate-300" />
                  <span>Reply</span>
                </button>

                {isMine && !message.isDeleted && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingLocal(true);
                      setEditText(message.content || "");
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-200 hover:text-white hover:bg-white/10 rounded-xl cursor-pointer transition-colors"
                  >
                    <FiEdit3 size={13} className="text-slate-300" />
                    <span>Edit Message</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    onForward(message);
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-200 hover:text-white hover:bg-white/10 rounded-xl cursor-pointer transition-colors"
                >
                  <FiShare2 size={13} className="text-slate-300" />
                  <span>Forward</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-200 hover:text-white hover:bg-white/10 rounded-xl cursor-pointer transition-colors"
                >
                  <FiCopy size={13} className="text-slate-300" />
                  <span>Copy Text</span>
                </button>

                <div className="h-px bg-white/[0.1] my-1"></div>

                {isMine && !message.isDeleted && (
                  <button
                    type="button"
                    onClick={() => {
                      onDelete(message, "everyone");
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-300 hover:text-rose-200 hover:bg-rose-500/15 rounded-xl cursor-pointer transition-colors"
                  >
                    <FiTrash2 size={13} />
                    <span>Delete for Everyone</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    onDelete(message, "me");
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-300 hover:text-rose-200 hover:bg-rose-500/15 rounded-xl cursor-pointer transition-colors"
                >
                  <FiTrash2 size={13} />
                  <span>Delete for Me</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ── HIGH-FIDELITY ZOOM LIGHTBOX OVERLAY DIALOG ── */}
      <AnimatePresence>
        {lightboxOpen && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-2xl z-[100] flex flex-col items-center justify-between p-6 select-none animate-fade-in">
            {/* Top Bar Context */}
            <div className="w-full flex items-center justify-between z-[110] relative max-w-5xl">
              <div className="flex items-center gap-3">
                <img
                  referrerPolicy="no-referrer"
                  src={
                    message.sender.profilePicture ||
                    "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
                  }
                  alt="sender"
                  className="w-10 h-10 rounded-full object-cover border border-white/15 shadow-md"
                />
                <div className="text-left">
                  <p className="text-sm font-extrabold text-white">
                    {message.sender.username}
                  </p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">
                    {format(new Date(message.createdAt), "MMMM dd, yyyy • hh:mm a")}
                  </p>
                </div>
              </div>

              {/* Close trigger */}
              <button
                type="button"
                onClick={() => {
                  setLightboxOpen(false);
                  setZoomLevel(1);
                }}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/10 text-white cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-md"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Central Draggable Image */}
            <div className="flex-1 w-full flex items-center justify-center overflow-hidden relative">
              <motion.div
                drag
                dragConstraints={{ left: -300, right: 300, top: -200, bottom: 200 }}
                dragElastic={0.15}
                className="cursor-grab active:cursor-grabbing max-w-full max-h-[70vh] flex items-center justify-center"
              >
                <motion.img
                  src={primaryAttachment?.url || message.mediaUrl}
                  alt="Lightbox View"
                  referrerPolicy="no-referrer"
                  style={{ scale: zoomLevel }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="max-w-[90vw] max-h-[65vh] object-contain rounded-2xl border border-white/5 shadow-2xl pointer-events-none"
                />
              </motion.div>
            </div>

            {/* Bottom Controls Bar */}
            <div className="w-full flex justify-center z-[110] relative max-w-lg mb-4">
              <div className="flex items-center gap-5 bg-white/5 border border-white/10 backdrop-blur-xl px-7 py-3.5 rounded-full shadow-2xl">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.25))}
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all active:scale-90"
                  title="Zoom Out"
                >
                  <span className="font-extrabold text-lg">-</span>
                </button>
                
                <span className="text-xs font-black tracking-widest text-blue-400 w-12 text-center uppercase">
                  {Math.round(zoomLevel * 100)}%
                </span>

                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(3, z + 0.25))}
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all active:scale-90"
                  title="Zoom In"
                >
                  <span className="font-extrabold text-lg">+</span>
                </button>

                <div className="w-px h-6 bg-white/10 mx-1"></div>

                <button
                  type="button"
                  onClick={() => setZoomLevel(1)}
                  className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-extrabold uppercase tracking-wider text-gray-300 hover:text-white transition-all"
                  title="Reset Zoom"
                >
                  Reset
                </button>

                <button
                  type="button"
                  onClick={() => window.open(primaryAttachment?.url || message.mediaUrl, "_blank")}
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-sky-500 hover:bg-sky-600 text-white transition-all shadow-md shadow-sky-500/10 active:scale-90"
                  title="Download Original"
                >
                  <FiDownload size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MessageBubble;
