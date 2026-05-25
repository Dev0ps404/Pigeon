import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { FiUsers, FiPlus, FiMessageSquare } from "react-icons/fi";
import api from "../services/api";
import toast from "react-hot-toast";
import { setChats, setActiveChat } from "../redux/slices/chatSlice";
import { useNavigate } from "react-router-dom";

const Groups = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { chats } = useSelector((state) => state.chat);

  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const { data } = await api.get("/friends");
        setAvailableUsers(data);
      } catch (error) {
        console.error("Error fetching friends:", error);
      }
    };
    fetchFriends();
  }, []);

  const handleCheckboxChange = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupName.trim() || selectedUsers.length < 2) {
      return toast.error("Group requires a name and at least 2 other members");
    }

    try {
      const { data } = await api.post("/chat/group", {
        name: groupName,
        users: JSON.stringify(selectedUsers),
      });

      dispatch(setChats([data, ...chats]));
      dispatch(setActiveChat(data));
      setIsModalOpen(false);
      setGroupName("");
      setSelectedUsers([]);
      toast.success("Group created successfully!");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create group");
    }
  };

  const groupChats = chats.filter((c) => c.isGroupChat);

  return (
    <div className="flex-1 flex h-full bg-[#f3f4f6] dark:bg-[#030712] overflow-hidden shadow-[-10px_0_30px_rgba(0,0,0,0.05)] border-t border-l border-white/50 dark:border-white/5 relative z-10">
      {/* Left panel: Group Chats list */}
      <div className="w-full md:w-80 lg:w-96 h-full flex flex-col bg-white dark:bg-dark-card border-r border-gray-100 dark:border-dark-border z-10 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Groups
          </h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-500/20 transition-all active:scale-95"
          >
            <FiPlus size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
          {groupChats.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <FiUsers size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No group chats yet</p>
            </div>
          ) : (
            groupChats.map((chat) => (
              <div
                key={chat._id}
                onClick={() => {
                  dispatch(setActiveChat(chat));
                  navigate("/");
                }}
                className="flex items-center p-3 rounded-2xl cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors"
              >
                <div className="w-12 h-12 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm">
                  {chat.chatName[0].toUpperCase()}
                </div>
                <div className="ml-4 flex-1 overflow-hidden">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                    {chat.chatName}
                  </h3>
                  <p className="text-xs text-gray-500 truncate">
                    {chat.users.length} members
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Panel Placeholder */}
      <div className="flex-1 hidden md:flex flex-col items-center justify-center bg-gray-50/30 dark:bg-[#0a0f1c]">
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="w-24 h-24 bg-gradient-to-tr from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-full flex items-center justify-center text-blue-600 mb-6 shadow-inner"
        >
          <FiUsers size={40} />
        </motion.div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">
          Group Messaging
        </h3>
        <p className="text-gray-500 text-sm max-w-xs text-center mt-2">
          Create groups to coordinate with multiple team members or friends at
          once.
        </p>
      </div>

      {/* Create Group Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl p-6 w-full max-w-md border border-gray-100 dark:border-dark-border"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Create New Group
            </h3>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Group Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Project Pigeon Team"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Add Members (Min 2)
                </label>
                <div className="max-h-48 overflow-y-auto space-y-2 border border-gray-100 dark:border-dark-border rounded-xl p-3 bg-gray-50 dark:bg-dark-bg custom-scrollbar">
                  {availableUsers.map((u) => (
                    <label
                      key={u._id}
                      className="flex items-center gap-3 cursor-pointer p-1.5 hover:bg-white dark:hover:bg-dark-card rounded-lg transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(u._id)}
                        onChange={() => handleCheckboxChange(u._id)}
                        className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                      <img
                        referrerPolicy="no-referrer"
                        src={u.profilePicture}
                        alt="avatar"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {u.username}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-dark-bg dark:hover:bg-dark-border rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-sm font-semibold text-white shadow-md shadow-blue-500/10"
                >
                  Create Group
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Groups;
