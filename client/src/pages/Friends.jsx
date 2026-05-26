import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUserPlus, 
  FiUsers, 
  FiSearch, 
  FiCheck, 
  FiX, 
  FiTrash2, 
  FiUserCheck, 
  FiClock, 
  FiMessageSquare,
  FiFilter,
  FiGrid,
  FiList,
  FiGlobe,
  FiChevronRight
} from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveChat, setChats } from '../redux/slices/chatSlice';

const Friends = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { chats } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);

  const [friends, setFriends] = useState([]);
  const [pending, setPending] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'online', 'offline'
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'list'
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const filterDropdownRef = useRef(null);
  const filterButtonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        filterDropdownRef.current && 
        !filterDropdownRef.current.contains(event.target) &&
        filterButtonRef.current &&
        !filterButtonRef.current.contains(event.target)
      ) {
        setShowFilterDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch Friends and Pending Requests
  const fetchData = async () => {
    try {
      setLoading(true);
      const friendsRes = await api.get('/friends');
      setFriends(friendsRes.data);

      const pendingRes = await api.get('/friends/pending');
      setPending(pendingRes.data);
    } catch (error) {
      console.error('Error fetching friends data:', error);
      toast.error('Failed to load friends');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (location.state?.openAddModal) {
      setShowAddModal(true);
      // Clear the state so refreshing/navigating back doesn't trigger it again
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  // Search users in DB to add
  const handleSearch = async (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (!val.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearchLoading(true);
      const { data } = await api.get(`/auth/search?search=${val}`);
      setSearchResults(data);
    } catch (error) {
      console.error(error);
    } finally {
      setSearchLoading(false);
    }
  };

  // Send friend request
  const sendRequest = async (recipientId) => {
    try {
      await api.post('/friends/request', { recipientId });
      toast.success('Friend request sent!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send request');
    }
  };

  // Accept/Decline pending request
  const respondRequest = async (requestId, status) => {
    try {
      await api.put(`/friends/respond/${requestId}`, { status });
      toast.success(`Request ${status === 'accepted' ? 'accepted' : 'declined'}`);
      fetchData();
    } catch (error) {
      toast.error('Action failed');
    }
  };

  // Remove/Unfriend
  const removeFriend = async (friendId) => {
    if (!window.confirm('Are you sure you want to remove this friend?')) return;
    try {
      await api.delete(`/friends/${friendId}`);
      toast.success('Friend removed');
      fetchData();
    } catch (error) {
      toast.error('Failed to remove friend');
    }
  };

  // Start chat directly with friend
  const startChat = async (friend) => {
    try {
      const existingChat = chats.find(c => 
        !c.isGroupChat && c.users.some(u => u._id === friend._id)
      );

      if (existingChat) {
        dispatch(setActiveChat(existingChat));
        navigate('/');
        return;
      }

      const { data } = await api.post('/chat', { userId: friend._id });
      dispatch(setChats([data, ...chats]));
      dispatch(setActiveChat(data));
      navigate('/');
    } catch (error) {
      toast.error('Could not start conversation');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'text-green-500';
      case 'away': return 'text-amber-500';
      default: return 'text-gray-400';
    }
  };

  const getStatusDotColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-amber-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'online': return 'Online';
      case 'away': return 'Away';
      default: return 'Offline';
    }
  };

  // Get recent contacts (last 4 friends, sorted by some criteria)
  const recentContacts = friends.slice(0, 4);

  const filteredFriends = friends.filter((friend) => {
    if (statusFilter === 'online') return friend.status === 'online';
    if (statusFilter === 'offline') return friend.status !== 'online';
    return true;
  });

  const visibleFriends = filteredFriends.slice(0, visibleCount);

  return (
    <div className="flex-1 h-full bg-white dark:bg-gray-900 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-8 py-8">

        {/* ── Pending Requests Banner ── */}
        <AnimatePresence>
          {pending.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 rounded-xl"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FiClock size={16} className="text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                    Pending Friend Requests ({pending.length})
                  </span>
                </div>
              </div>
              <div className="space-y-2.5">
                {pending.map((req) => (
                  <div 
                    key={req._id}
                    className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700"
                  >
                    <div className="flex items-center gap-3">
                      <img referrerPolicy="no-referrer" 
                        src={req.requester.profilePicture} 
                        alt="avatar" 
                        className="w-9 h-9 rounded-full object-cover" 
                      />
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{req.requester.username}</h4>
                        <p className="text-[11px] text-gray-400">Wants to connect</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => respondRequest(req._id, 'accepted')}
                        className="w-8 h-8 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition-colors"
                        title="Accept"
                      >
                        <FiCheck size={14} />
                      </button>
                      <button 
                        onClick={() => respondRequest(req._id, 'declined')}
                        className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                        title="Decline"
                      >
                        <FiX size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Header Row ── */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 tracking-tight">
              Friends & Family
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Stay connected with your inner circle.
            </p>
          </div>

          <div className="flex items-center gap-3 relative">
            {/* Add New Friend Button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm cursor-pointer select-none active:scale-95"
            >
              <FiUserPlus size={16} />
              <span>Add Friend</span>
            </button>

            {/* Dynamic Filter Dropdown */}
            <div className="relative">
              <button 
                ref={filterButtonRef}
                onClick={() => setShowFilterDropdown(prev => !prev)}
                className={`flex items-center gap-2 px-4 py-2.5 border text-sm font-medium rounded-lg transition-colors cursor-pointer select-none active:scale-95 ${
                  statusFilter !== 'all' 
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <FiFilter size={15} />
                <span>
                  {statusFilter === 'all' && 'Filter'}
                  {statusFilter === 'online' && 'Online'}
                  {statusFilter === 'offline' && 'Offline'}
                </span>
              </button>
              
              <AnimatePresence>
                {showFilterDropdown && (
                  <motion.div
                    ref={filterDropdownRef}
                    initial={{ opacity: 0, scale: 0.95, y: -5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -5 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 z-20 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden py-1"
                  >
                    {[
                      { id: 'all', label: 'All Friends' },
                      { id: 'online', label: 'Online Only' },
                      { id: 'offline', label: 'Offline Only' }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setStatusFilter(opt.id);
                          setShowFilterDropdown(false);
                          setVisibleCount(6); // reset pagination when filter shifts
                        }}
                        className={`w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between cursor-pointer ${
                          statusFilter === opt.id 
                            ? 'text-blue-600 dark:text-blue-400 bg-blue-50/20 dark:bg-blue-950/10' 
                            : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {statusFilter === opt.id && <FiCheck size={12} className="text-blue-600 dark:text-blue-400" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Dynamic Grid / List Layout Selector */}
            <button 
              onClick={() => setViewMode(prev => prev === 'grid' ? 'list' : 'grid')}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer select-none active:scale-95"
            >
              {viewMode === 'grid' ? <FiList size={15} /> : <FiGrid size={15} />}
              <span>{viewMode === 'grid' ? 'List View' : 'Grid View'}</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* ── Recent Contacts ── */}
            {recentContacts.length > 0 && (
              <div className="mb-10">
                <div className="flex items-center gap-2 mb-5">
                  <FiClock size={18} className="text-gray-700 dark:text-gray-300" />
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">
                    Recent Contacts
                  </h2>
                </div>
                <div className="flex gap-8 overflow-x-auto pb-2">
                  {recentContacts.map((friend) => (
                    <motion.div 
                      key={friend._id}
                      whileHover={{ y: -2 }}
                      onClick={() => startChat(friend)}
                      className="flex flex-col items-center gap-2 cursor-pointer group shrink-0"
                    >
                      <div className="relative">
                        <img referrerPolicy="no-referrer" 
                          src={friend.profilePicture} 
                          alt={friend.username} 
                          className="w-14 h-14 rounded-full object-cover border-2 border-gray-100 dark:border-gray-700 group-hover:border-blue-300 transition-colors"
                        />
                        <span className={`absolute bottom-0.5 right-0.5 w-3.5 h-3.5 ${getStatusDotColor(friend.status)} border-2 border-white dark:border-gray-900 rounded-full`} />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                          {friend.username}
                        </p>
                        <p className="text-[11px] text-gray-400">Just now</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Separator ── */}
            <div className="border-t border-gray-100 dark:border-gray-800 mb-8" />

            {/* ── All Friends ── */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <FiGlobe size={18} className="text-gray-700 dark:text-gray-300" />
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">
                    All Friends
                  </h2>
                </div>
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-3 py-1 rounded-lg border border-blue-100 dark:border-blue-900/40 select-none">
                  {statusFilter === 'all' ? `${friends.length} Friends` : `Showing ${filteredFriends.length} of ${friends.length} Friends`}
                </span>
              </div>

              {friends.length === 0 ? (
                <div className="text-center py-16">
                  <FiUsers size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">No friends yet</h3>
                  <p className="text-sm text-gray-400 max-w-xs mx-auto">
                    Start building your network by adding friends using the button above.
                  </p>
                </div>
              ) : (
                <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "flex flex-col gap-3.5 max-w-2xl mx-auto w-full"}>
                  {visibleFriends.map((friend) => (
                    <motion.div 
                      key={friend._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.008 }}
                      className={`flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 bg-white dark:bg-gray-900 hover:shadow-sm transition-all group ${
                        viewMode === 'list' ? 'px-6 shadow-sm' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="relative shrink-0">
                          <img referrerPolicy="no-referrer" 
                            src={friend.profilePicture} 
                            alt={friend.username} 
                            className="w-12 h-12 rounded-full object-cover" 
                          />
                          <span className={`absolute bottom-0.5 right-0.5 w-3 h-3 ${getStatusDotColor(friend.status)} border-2 border-white dark:border-gray-900 rounded-full`} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {friend.username}
                          </h4>
                          <p className="text-xs text-gray-400 truncate">
                            {friend.customStatus || friend.email || 'Pigeon User'}
                            <span className="mx-1.5">·</span>
                            <span className={`font-medium ${getStatusColor(friend.status)}`}>
                              {getStatusLabel(friend.status)}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Actions (visible on hover) */}
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button 
                          onClick={() => startChat(friend)}
                          className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                          title="Message"
                        >
                          <FiMessageSquare size={14} />
                        </button>
                        <button 
                          onClick={() => removeFriend(friend._id)}
                          className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                          title="Remove"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Load More Button */}
              {visibleCount < filteredFriends.length && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={() => setVisibleCount(prev => prev + 6)}
                    className="px-6 py-2.5 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-sm font-semibold rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors cursor-pointer select-none active:scale-95"
                  >
                    Load More Friends
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Add Friend Modal ── */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <FiUserPlus size={18} className="text-blue-600" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Add New Friend</h3>
                </div>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <FiX size={18} />
                </button>
              </div>

              {/* Search */}
              <div className="p-5">
                <div className="relative mb-4">
                  <FiSearch size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text"
                    placeholder="Search username or email..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-sm text-gray-900 dark:text-white transition-all"
                    autoFocus
                  />
                </div>

                {/* Results */}
                <div className="max-h-64 overflow-y-auto space-y-2.5">
                  {searchLoading ? (
                    <p className="text-xs text-center text-gray-400 py-4">Searching...</p>
                  ) : searchQuery && searchResults.length === 0 ? (
                    <p className="text-xs text-center text-gray-400 py-4">No users found</p>
                  ) : !searchQuery ? (
                    <p className="text-xs text-center text-gray-400 py-4">Type a name or email to search</p>
                  ) : (
                    searchResults.map((userRes) => (
                      <div 
                        key={userRes._id}
                        className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
                      >
                        <div className="flex items-center gap-3">
                          <img referrerPolicy="no-referrer" src={userRes.profilePicture} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{userRes.username}</h4>
                            <p className="text-[11px] text-gray-500 truncate max-w-[140px]">{userRes.email}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => sendRequest(userRes._id)}
                          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                        >
                          <FiUserPlus size={13} />
                          Add
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Friends;
