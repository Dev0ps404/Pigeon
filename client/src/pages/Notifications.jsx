import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiBell,
  FiMail,
  FiPhoneMissed,
  FiUserPlus,
  FiCheckCircle,
  FiTrash2,
  FiInbox,
} from "react-icons/fi";
import api from "../services/api";
import toast from "react-hot-toast";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/notifications");
      setNotifications(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(
        notifications.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
      );
      toast.success("Marked as read");
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const deleteNotif = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(notifications.filter((n) => n._id !== id));
      toast.success("Notification cleared");
    } catch (error) {
      toast.error("Failed to delete notification");
    }
  };

  const clearAll = async () => {
    if (notifications.length === 0) return;
    if (!window.confirm("Are you sure you want to clear all notifications?"))
      return;
    try {
      // Simulate bulk deleting
      for (const notif of notifications) {
        await api.delete(`/notifications/${notif._id}`);
      }
      setNotifications([]);
      toast.success("All notifications cleared");
    } catch (error) {
      toast.error("Failed to clear all notifications");
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "friend_request":
        return <FiUserPlus className="text-blue-500" size={18} />;
      case "missed_call":
        return <FiPhoneMissed className="text-red-500" size={18} />;
      case "mention":
      case "message":
        return <FiMail className="text-purple-500" size={18} />;
      default:
        return <FiBell className="text-gray-500" size={18} />;
    }
  };

  return (
    <div className="flex-1 flex h-full bg-[#f3f4f6] dark:bg-[#030712] overflow-hidden shadow-[-10px_0_30px_rgba(0,0,0,0.05)] border-t border-l border-white/50 dark:border-white/5 relative z-10">
      {/* Left Notification List Pane */}
      <div className="w-full md:w-80 lg:w-96 h-full flex flex-col bg-white dark:bg-dark-card border-r border-gray-100 dark:border-dark-border z-10 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            <span>Alerts</span>
            {notifications.filter((n) => !n.isRead).length > 0 && (
              <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {notifications.filter((n) => !n.isRead).length} new
              </span>
            )}
          </h2>
          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              className="text-xs font-semibold text-red-500 hover:text-red-600 hover:underline flex items-center gap-1"
            >
              <FiTrash2 size={13} />
              Clear All
            </button>
          )}
        </div>

        {/* List of alerts */}
        <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
          {loading ? (
            <div className="text-center py-8 text-gray-400">
              Loading alerts...
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <FiInbox
                size={36}
                className="mx-auto mb-2 opacity-40 animate-pulse"
              />
              <p className="text-sm">Inbox is completely clear</p>
              <p className="text-xs opacity-65 mt-1">
                We'll alert you when something happens.
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {notifications.map((notif, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  key={notif._id}
                  className={`flex items-start p-4 rounded-2xl border transition-all ${
                    notif.isRead
                      ? "bg-gray-50/40 dark:bg-dark-bg/20 border-gray-100 dark:border-dark-border/40 opacity-75"
                      : "bg-blue-50/30 dark:bg-blue-950/10 border-blue-100/50 dark:border-blue-900/20 ring-1 ring-blue-500/10 shadow-sm"
                  }`}
                >
                  <div className="p-2 bg-white dark:bg-dark-bg rounded-xl shadow-sm mr-3 mt-0.5">
                    {getIcon(notif.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white font-medium break-words leading-relaxed">
                      {notif.content}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {new Date(notif.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1.5 ml-2.5">
                    {!notif.isRead && (
                      <button
                        onClick={() => markRead(notif._id)}
                        className="w-7 h-7 bg-green-500 text-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
                        title="Mark as Read"
                      >
                        <FiCheckCircle size={13} />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotif(notif._id)}
                      className="w-7 h-7 bg-gray-100 hover:bg-red-50 dark:bg-dark-bg dark:hover:bg-red-950/20 text-gray-400 hover:text-red-500 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all border border-gray-200/40 dark:border-dark-border"
                      title="Clear"
                    >
                      <FiTrash2 size={13} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Right details view placeholder */}
      <div className="flex-1 hidden md:flex flex-col items-center justify-center bg-gray-50/30 dark:bg-[#0a0f1c]">
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="w-24 h-24 bg-gradient-to-tr from-purple-100 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-full flex items-center justify-center text-purple-600 mb-6 shadow-inner"
        >
          <FiBell size={40} />
        </motion.div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">
          Active Alerts & Activity
        </h3>
        <p className="text-gray-500 text-sm max-w-xs text-center mt-2">
          Stay up to date with core notifications, incoming calls, mentions, and
          friend activity feeds instantly.
        </p>
      </div>
    </div>
  );
};

export default Notifications;
