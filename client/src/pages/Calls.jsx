import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  FiPhoneCall, 
  FiVideo, 
  FiPhone, 
  FiCalendar, 
  FiClock, 
  FiArrowUpRight, 
  FiArrowDownLeft,
  FiPhoneIncoming,
  FiPhoneOutgoing,
  FiSliders,
  FiActivity
} from 'react-icons/fi';
import api from '../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Calls = () => {
  const { user } = useSelector((state) => state.auth);
  const [callHistory, setCallHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchCallHistory = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/calls');
      setCallHistory(data);
    } catch (error) {
      console.error('Error fetching call logs:', error);
      toast.error('Failed to load call history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCallHistory();
  }, []);

  const handleCallBack = (otherUser, callType) => {
    if (!otherUser) return;
    window.dispatchEvent(
      new CustomEvent('initiate-call', {
        detail: { otherUser, type: callType },
      })
    );
  };

  const filteredHistory = callHistory.filter((call) => {
    if (activeTab === 'missed') return call.status === 'missed';
    return true;
  });

  const formatDuration = (seconds) => {
    if (!seconds) return '0s';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  return (
    <div className="flex-1 flex h-full bg-white dark:bg-gray-900 overflow-hidden relative">
      
      {/* Left List Pane */}
      <div className="w-full md:w-80 lg:w-[400px] h-full flex flex-col bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 z-10 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400">Call History</h2>
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-3 py-1 rounded-lg border border-blue-100 dark:border-blue-900/40 flex items-center gap-1.5">
            <FiActivity size={12} className="animate-pulse" />
            <span>{callHistory.length} calls</span>
          </span>
        </div>
        
        {/* Tab Buttons */}
        <div className="flex gap-2 bg-gray-100 dark:bg-gray-800/60 p-1 rounded-xl mb-6">
          <button 
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${activeTab === 'all' ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            All Calls
          </button>
          <button 
            onClick={() => setActiveTab('missed')}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${activeTab === 'missed' ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            Missed
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <FiPhoneCall size={40} className="mx-auto mb-3 opacity-30 text-blue-500" />
              <p className="text-sm font-medium">No call logs found</p>
              <p className="text-xs text-gray-400 mt-1">Calls you make or receive will show up here.</p>
            </div>
          ) : (
            filteredHistory.map((call, idx) => {
              // Determine if incoming or outgoing
              const isOutgoing = call.caller?._id === user?._id;
              const partner = isOutgoing ? call.receiver : call.caller;
              
              if (!partner) return null;

              return (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  key={call._id}
                  className="group flex items-center justify-between p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center min-w-0">
                    <div className="relative">
                      <img referrerPolicy="no-referrer" 
                        src={partner.profilePicture || 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg'} 
                        alt="avatar" 
                        className="w-11 h-11 rounded-full object-cover border border-gray-100 dark:border-gray-800" 
                      />
                      <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] shadow-sm border border-white dark:border-gray-900 ${
                        isOutgoing ? 'bg-blue-500' : call.status === 'missed' ? 'bg-red-500' : 'bg-green-500'
                      }`}>
                        {isOutgoing ? (
                          <FiArrowUpRight size={10} />
                        ) : call.status === 'missed' ? (
                          <FiArrowDownLeft size={10} className="text-white" />
                        ) : (
                          <FiArrowDownLeft size={10} />
                        )}
                      </span>
                    </div>
                    
                    <div className="ml-3.5 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {partner.username}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                        {call.type === 'video' ? (
                          <FiVideo className="text-indigo-500" size={12} />
                        ) : (
                          <FiPhone className="text-green-500" size={12} />
                        )}
                        <span>{format(new Date(call.createdAt), 'MMM dd, HH:mm')}</span>
                        {call.status === 'completed' && (
                          <>
                            <span>·</span>
                            <span>{formatDuration(call.duration)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Status badge or direct Callback button on hover */}
                    <div className="group-hover:hidden transition-all">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        call.status === 'completed' 
                          ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400 border border-green-100 dark:border-green-900/30' 
                          : 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border border-red-100 dark:border-red-900/30'
                      }`}>
                        {call.status}
                      </span>
                    </div>

                    <button 
                      onClick={() => handleCallBack(partner, call.type)}
                      className="hidden group-hover:flex w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all hover:scale-105 active:scale-95"
                      title={`Call back (${call.type})`}
                    >
                      {call.type === 'video' ? <FiVideo size={14} /> : <FiPhone size={14} />}
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
 
      {/* Detail Pane */}
      <div className="flex-1 hidden md:flex flex-col items-center justify-center bg-gray-50/30 dark:bg-[#0a0f1c] relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-72 h-72 bg-blue-200/10 dark:bg-blue-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-indigo-200/10 dark:bg-indigo-500/5 rounded-full blur-3xl" />
        </div>

        <motion.div 
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          className="w-24 h-24 bg-gradient-to-tr from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-full flex items-center justify-center text-blue-600 mb-6 shadow-inner z-10"
        >
          <FiPhoneCall size={40} />
        </motion.div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-white z-10">Crystal Clear Calling</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs text-center mt-2 leading-relaxed z-10">
          Connect instantly with high-fidelity peer-to-peer audio and video stream capabilities powered by modern WebRTC.
        </p>
      </div>

    </div>
  );
};

export default Calls;
