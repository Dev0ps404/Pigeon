import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUser, 
  FiSettings, 
  FiCamera, 
  FiCheck, 
  FiUpload, 
  FiLock, 
  FiActivity, 
  FiSliders,
  FiMessageSquare,
  FiUsers,
  FiPhoneCall,
  FiChevronRight,
  FiChevronDown,
  FiSearch,
  FiX,
  FiVolume2,
  FiBell,
  FiInfo,
  FiTrash2,
  FiHelpCircle,
  FiPlus,
  FiLogOut,
  FiStar,
  FiShield,
  FiMoon,
  FiSun,
  FiSmartphone,
  FiCpu
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { setCredentials, logout } from '../redux/slices/authSlice';

const Settings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState('account');
  const [showMobileDetail, setShowMobileDetail] = useState(false);

  // Search filtering state
  const [searchQuery, setSearchQuery] = useState('');

  // Account form states
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [customStatus, setCustomStatus] = useState(user?.customStatus || '');
  const [presence, setPresence] = useState(user?.status || 'online');
  const [isPremium, setIsPremium] = useState(user?.premium || false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Privacy states
  const [readReceipts, setReadReceipts] = useState(user?.readReceipts !== false);
  const [disappearingMessages, setDisappearingMessages] = useState(user?.disappearingMessages || 'off');
  const [blockedList, setBlockedList] = useState(user?.blockedContacts || []);
  const [allUsers, setAllUsers] = useState([]);
  const [isAddingBlock, setIsAddingBlock] = useState(false);

  // Notification states
  const [showPreviews, setShowPreviews] = useState(user?.showPreviews !== false);
  const [messageSound, setMessageSound] = useState('chime');
  const [groupSound, setGroupSound] = useState('ding');
  const [callSound, setCallSound] = useState('melody');

  // Loading indicator states
  const [saving, setSaving] = useState(false);
  const [uploadingPic, setUploadingPic] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  
  const fileInputRef = useRef(null);

  // Help & Feedback
  const [feedbackEmail, setFeedbackEmail] = useState(user?.email || '');
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [faqExpanded, setFaqExpanded] = useState({});

  // Auto-Download states (local interactive demo)
  const [autoWifi, setAutoWifi] = useState(true);
  const [autoCellular, setAutoCellular] = useState(false);
  const [autoAudio, setAutoAudio] = useState(true);
  const [autoDocs, setAutoDocs] = useState(false);

  // Appearance states
  const [selectedTheme, setSelectedTheme] = useState(user?.selectedTheme || 'dark');
  const [accentColor, setAccentColor] = useState(user?.accentColor || 'indigo');
  const [fontSize, setFontSize] = useState(user?.fontSize || 14);

  // Connected Devices states
  const [sessions, setSessions] = useState([
    { id: '1', name: 'Windows Desktop Client', client: 'Pigeon Electron App v2.4.0', ip: '192.168.1.108', location: 'New Delhi, India', active: 'Active Now', current: true },
    { id: '2', name: 'iPhone 15 Pro Max', client: 'Pigeon iOS Mobile v2.3.9', ip: '103.45.201.88', location: 'Mumbai, India', active: '2 hours ago', current: false },
    { id: '3', name: 'Safari on macOS Sonoma', client: 'Web Client Safari v17.4', ip: '172.56.90.112', location: 'San Francisco, USA', active: '3 days ago', current: false }
  ]);

  // AI Preferences states
  const [aiSmartReply, setAiSmartReply] = useState(user?.aiSmartReply !== false);
  const [aiSummarizer, setAiSummarizer] = useState(user?.aiSummarizer || false);
  const [aiToneEnhancer, setAiToneEnhancer] = useState(user?.aiToneEnhancer !== false);
  const [aiPersonality, setAiPersonality] = useState(user?.aiPersonality || 'concierge');

  // Sync profile details if changed in Redux
  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setEmail(user.email || '');
      setBio(user.bio || '');
      setPhoneNumber(user.phoneNumber || '');
      setCustomStatus(user.customStatus || '');
      setPresence(user.status || 'online');
      setIsPremium(user.premium || false);
      setReadReceipts(user.readReceipts !== false);
      setDisappearingMessages(user.disappearingMessages || 'off');
      setBlockedList(user.blockedContacts || []);
      setSelectedTheme(user.selectedTheme || 'dark');
      setAccentColor(user.accentColor || 'indigo');
      setFontSize(user.fontSize || 14);
      setAiSmartReply(user.aiSmartReply !== false);
      setAiSummarizer(user.aiSummarizer || false);
      setAiToneEnhancer(user.aiToneEnhancer !== false);
      setAiPersonality(user.aiPersonality || 'concierge');
    }
  }, [user]);

  // Reset avatar image loading state if user profile picture changes
  useEffect(() => {
    setAvatarFailed(false);
  }, [user?.profilePicture]);

  // Fetch all users for Blocked Contacts listing
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get('/auth/search?search=');
        setAllUsers(data);
      } catch (err) {
        console.error('Failed to load user directory for blocking', err);
      }
    };
    fetchUsers();
  }, []);

  // Sound Synthesizer Preview Generator using Web Audio API
  const playSynthSound = (soundType) => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      if (soundType === 'chime') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(659.25, audioCtx.currentTime); // E5
        gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1);

        setTimeout(() => {
          const osc2 = audioCtx.createOscillator();
          const gain2 = audioCtx.createGain();
          osc2.connect(gain2);
          gain2.connect(audioCtx.destination);
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(880.00, audioCtx.currentTime); // A5
          gain2.gain.setValueAtTime(0.05, audioCtx.currentTime);
          osc2.start();
          osc2.stop(audioCtx.currentTime + 0.15);
        }, 110);
      } else if (soundType === 'ding') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(987.77, audioCtx.currentTime); // B5
        gainNode.gain.setValueAtTime(0.06, audioCtx.currentTime);
        oscillator.start();
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);
        oscillator.stop(audioCtx.currentTime + 0.5);
      } else if (soundType === 'classic') {
        oscillator.type = 'triangle';
        const now = audioCtx.currentTime;
        oscillator.frequency.setValueAtTime(523.25, now); // C5
        oscillator.frequency.setValueAtTime(659.25, now + 0.1); // E5
        oscillator.frequency.setValueAtTime(783.99, now + 0.2); // G5
        gainNode.gain.setValueAtTime(0.04, now);
        oscillator.start();
        oscillator.stop(now + 0.35);
      } else if (soundType === 'melody') {
        const now = audioCtx.currentTime;
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.04, now);
        oscillator.frequency.setValueAtTime(440.00, now); // A4
        oscillator.frequency.setValueAtTime(554.37, now + 0.15); // C#5
        oscillator.frequency.setValueAtTime(659.25, now + 0.3); // E5
        oscillator.frequency.setValueAtTime(880.00, now + 0.45); // A5
        oscillator.start();
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
        oscillator.stop(now + 0.8);
      } else if (soundType === 'uplifting') {
        const now = audioCtx.currentTime;
        oscillator.type = 'sawtooth';
        gainNode.gain.setValueAtTime(0.02, now);
        oscillator.frequency.setValueAtTime(587.33, now); // D5
        oscillator.frequency.setValueAtTime(783.99, now + 0.08); // G5
        oscillator.frequency.setValueAtTime(1046.50, now + 0.16); // C6
        oscillator.start();
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
        oscillator.stop(now + 0.4);
      }
    } catch (err) {
      console.warn('AudioContext failed.', err);
    }
  };

  // Avatar Upload Handler
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      return toast.error('File size cannot exceed 10MB');
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploadingPic(true);
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Avatar uploaded successfully!');
      const updateRes = await api.put('/auth/profile', { profilePicture: data.url });
      dispatch(setCredentials({ user: updateRes.data, token }));
    } catch (error) {
      toast.error('File upload failed. fallback avatar loaded.');
      const fallbackUrl = `https://xsgames.co/randomusers/assets/avatars/male/${Math.floor(Math.random() * 50)}.jpg`;
      const updateRes = await api.put('/auth/profile', { profilePicture: fallbackUrl });
      dispatch(setCredentials({ user: updateRes.data, token }));
    } finally {
      setUploadingPic(false);
    }
  };

  // Submit Account Info
  const handleSaveAccount = async (e) => {
    if (e) e.preventDefault();
    if (!username.trim() || !email.trim()) return toast.error('Username and Email are required');

    try {
      setSaving(true);
      const { data } = await api.put('/auth/profile', {
        username,
        email,
        bio,
        phoneNumber,
        customStatus,
        status: presence,
        premium: isPremium,
      });

      dispatch(setCredentials({ user: data, token }));
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save account settings');
    } finally {
      setSaving(false);
    }
  };

  // Toggle premium membership state
  const handleTogglePremium = async (val) => {
    setIsPremium(val);
    try {
      const { data } = await api.put('/auth/profile', { premium: val });
      dispatch(setCredentials({ user: data, token }));
      toast.success(val ? 'Premium Star Shimmer Activated!' : 'Premium mode disabled.');
    } catch (error) {
      toast.error('Failed to update premium membership state');
    }
  };

  // Change Password
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!password) return toast.error('Please enter a new password');
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    if (password !== confirmPassword) return toast.error('Passwords do not match');

    try {
      setSaving(true);
      await api.put('/auth/profile', { password });
      toast.success('Password updated successfully!');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error('Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  // Read Receipts Toggle
  const handleToggleReadReceipts = async (val) => {
    setReadReceipts(val);
    try {
      const { data } = await api.put('/auth/profile', { readReceipts: val });
      dispatch(setCredentials({ user: data, token }));
      toast.success(`Read receipts turned ${val ? 'ON' : 'OFF'}`);
    } catch (error) {
      toast.error('Failed to save receipts setting');
    }
  };

  // Show Previews Toggle
  const handleToggleShowPreviews = async (val) => {
    setShowPreviews(val);
    try {
      const { data } = await api.put('/auth/profile', { showPreviews: val });
      dispatch(setCredentials({ user: data, token }));
      toast.success(`Previews turned ${val ? 'ON' : 'OFF'}`);
    } catch (error) {
      toast.error('Failed to save previews setting');
    }
  };

  // Disappearing messages timer
  const handleSelectDisappearing = async (mode) => {
    setDisappearingMessages(mode);
    try {
      const { data } = await api.put('/auth/profile', { disappearingMessages: mode });
      dispatch(setCredentials({ user: data, token }));
      toast.success(`Disappearing messages set to: ${mode === 'off' ? 'Off' : mode}`);
    } catch (err) {
      toast.error('Failed to update disappearing timer');
    }
  };

  // AI preferences updates
  const handleToggleAiSmartReply = async (val) => {
    setAiSmartReply(val);
    try {
      const { data } = await api.put('/auth/profile', { aiSmartReply: val });
      dispatch(setCredentials({ user: data, token }));
      toast.success(`Smart Replies turned ${val ? 'ON' : 'OFF'}`);
    } catch (err) {
      toast.error('Failed to save Smart Replies setting');
    }
  };

  const handleToggleAiSummarizer = async (val) => {
    setAiSummarizer(val);
    try {
      const { data } = await api.put('/auth/profile', { aiSummarizer: val });
      dispatch(setCredentials({ user: data, token }));
      toast.success(`Summarizer turned ${val ? 'ON' : 'OFF'}`);
    } catch (err) {
      toast.error('Failed to save Summarizer setting');
    }
  };

  const handleToggleAiToneEnhancer = async (val) => {
    setAiToneEnhancer(val);
    try {
      const { data } = await api.put('/auth/profile', { aiToneEnhancer: val });
      dispatch(setCredentials({ user: data, token }));
      toast.success(`Tone Enhancer turned ${val ? 'ON' : 'OFF'}`);
    } catch (err) {
      toast.error('Failed to save Tone Enhancer setting');
    }
  };

  const handleSelectAiPersonality = async (val, title) => {
    setAiPersonality(val);
    try {
      const { data } = await api.put('/auth/profile', { aiPersonality: val });
      dispatch(setCredentials({ user: data, token }));
      toast.success(`Persona set to ${title}`);
    } catch (err) {
      toast.error('Failed to save AI Persona');
    }
  };

  // Appearance preferences updates
  const handleSelectTheme = async (val, title) => {
    setSelectedTheme(val);
    try {
      const { data } = await api.put('/auth/profile', { selectedTheme: val });
      dispatch(setCredentials({ user: data, token }));
      toast.success(`${title} Theme enabled`);
    } catch (err) {
      toast.error('Failed to save theme setting');
    }
  };

  const handleSelectAccentColor = async (val, name) => {
    setAccentColor(val);
    try {
      const { data } = await api.put('/auth/profile', { accentColor: val });
      dispatch(setCredentials({ user: data, token }));
      toast.success(`${name} Accent applied`);
    } catch (err) {
      toast.error('Failed to save accent color setting');
    }
  };

  const handleSelectFontSize = async (val) => {
    setFontSize(val);
    try {
      const { data } = await api.put('/auth/profile', { fontSize: val });
      dispatch(setCredentials({ user: data, token }));
    } catch (err) {
      toast.error('Failed to save font size setting');
    }
  };

  // Block/Unblock users
  const handleToggleBlockUser = async (userId, userUsername) => {
    let updatedBlocks;
    const isAlreadyBlocked = blockedList.includes(userId);

    if (isAlreadyBlocked) {
      updatedBlocks = blockedList.filter(id => id !== userId);
    } else {
      updatedBlocks = [...blockedList, userId];
    }

    setBlockedList(updatedBlocks);
    try {
      const { data } = await api.put('/auth/profile', { blockedContacts: updatedBlocks });
      dispatch(setCredentials({ user: data, token }));
      toast.success(isAlreadyBlocked ? `Unblocked ${userUsername}` : `Blocked ${userUsername}`);
    } catch (err) {
      toast.error('Failed to update blocked directory');
      setBlockedList(blockedList);
    }
  };

  // Support Form submission
  const handleSendFeedback = (e) => {
    e.preventDefault();
    if (!feedbackMsg.trim()) return toast.error('Feedback message cannot be empty');

    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1200)),
      {
        loading: 'Connecting to Pigeon Support...',
        success: 'Thank you! Your feedback has been received.',
        error: 'Connection failed.',
      }
    );
    setFeedbackMsg('');
  };

  // Logout confirm
  const handleLogoutConfirm = async () => {
    try {
      await api.post('/auth/logout');
      dispatch(logout());
      navigate('/login');
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  // Search filter matching categories
  const matchesSearch = (title, desc, category) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return title.toLowerCase().includes(q) || 
           desc.toLowerCase().includes(q) || 
           category.toLowerCase().includes(q);
  };

  // Premium / Standard avatar dynamic initials circle fallback
  const renderAvatar = (size = "w-24 h-24", textClass = "text-3xl") => {
    const initial = (username || user?.username || 'U').charAt(0).toUpperCase();
    const colors = [
      'from-blue-500 to-indigo-600',
      'from-teal-500 to-emerald-600',
      'from-purple-500 to-indigo-600',
      'from-rose-500 to-pink-600',
      'from-amber-500 to-orange-600'
    ];
    const colorIndex = (username || user?.username || 'U').charCodeAt(0) % colors.length;
    const selectedGradient = colors[colorIndex];

    if (user?.profilePicture && !avatarFailed) {
      return (
        <img referrerPolicy="no-referrer" 
          src={user.profilePicture} 
          alt="Avatar" 
          className={`${size} rounded-full object-cover border-4 border-white dark:border-slate-900 shadow-sm`}
          onError={() => setAvatarFailed(true)}
        />
      );
    }

    return (
      <div className={`${size} rounded-full bg-gradient-to-tr ${selectedGradient} text-white flex items-center justify-center font-black tracking-wider border-4 border-white dark:border-slate-900 shadow-sm ${textClass} select-none`}>
        {initial}
      </div>
    );
  };

  // Tabs structure
  const tabs = [
    { id: 'account', label: 'My Account', desc: 'Profile details & avatar configuration', icon: FiUser },
    { id: 'privacy', label: 'Privacy & Security', desc: 'Read receipts, timer & blocked list', icon: FiShield },
    { id: 'notifications', label: 'Notification Alerts', desc: 'Ringtones, previews & synth testing', icon: FiBell },
    { id: 'storage', label: 'Data & Storage', desc: 'Telemetry usage metrics & limits', icon: FiActivity },
    { id: 'appearance', label: 'Appearance', desc: 'Custom themes, colors & layout scale', icon: FiMoon },
    { id: 'devices', label: 'Connected Devices', desc: 'Logged-in active sessions authorization', icon: FiSmartphone },
    { id: 'ai', label: 'AI Preferences', desc: 'AI smart reply & summaries controls', icon: FiCpu },
    { id: 'help', label: 'Help & Support', desc: 'FAQ accordions & developer tickets', icon: FiHelpCircle }
  ];

  return (
    <div className="flex-1 flex h-full bg-[#f8fafc] dark:bg-[#070b13] overflow-hidden rounded-tl-[2.5rem] shadow-[-10px_0_30px_rgba(0,0,0,0.05)] border-t border-l border-white/50 dark:border-white/5 relative z-10">
      
      {/* Inline animations for shimmer */}
      <style>{`
        @keyframes goldShimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .premium-shimmer-border {
          background: linear-gradient(270deg, #f59e0b, #eab308, #f59e0b, #b45309);
          background-size: 400% 400%;
          animation: goldShimmer 8s ease infinite;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.25);
          border-radius: 9999px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.15);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.4);
        }
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* FULL VIEWPORT CONTAINER: Single-Pane Desktop-First Horizontal Tabs Layout */}
      <div className="flex-1 flex flex-col h-full overflow-hidden w-full bg-white dark:bg-[#0b0f19]">
        
        {/* Premium Header & Tabs Area */}
        <div className="p-6 pb-4 bg-transparent select-none relative">
          {/* Floating Background Glows */}
          <div className="absolute top-[-50px] left-[10%] w-72 h-72 bg-gradient-to-tr from-primary-500/10 to-primary-600/10 dark:from-primary-500/5 dark:to-primary-600/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-[-20px] right-[20%] w-60 h-60 bg-gradient-to-tr from-purple-500/10 to-pink-500/10 dark:from-purple-500/5 dark:to-pink-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Premium Glassmorphism Header Card */}
          <div className="relative bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border border-white/30 dark:border-white/5 shadow-2xl rounded-3xl p-6 overflow-hidden mb-6">
            {/* Inner glow accent */}
            <div className="absolute -inset-px bg-gradient-to-r from-primary-500/10 via-transparent to-primary-600/10 rounded-3xl pointer-events-none" />
            
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
              <div className="flex items-center gap-4">
                {/* Animated settings cog icon */}
                <motion.div 
                  whileHover={{ rotate: 180 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-600 to-primary-500 text-white flex items-center justify-center shadow-lg shadow-primary-500/20 cursor-pointer"
                >
                  <FiSettings size={22} />
                </motion.div>

                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                      Settings
                    </h1>
                    
                    {/* Animated Pulsing Version Badge */}
                    <motion.span 
                      animate={{ 
                        boxShadow: ["0px 0px 4px rgba(var(--primary-500), 0.2)", "0px 0px 12px rgba(var(--primary-500), 0.4)", "0px 0px 4px rgba(var(--primary-500), 0.2)"] 
                      }}
                      transition={{ repeat: Infinity, duration: 3 }}
                      className="text-[10px] px-3 py-1 font-black text-primary-600 dark:text-primary-400 bg-primary-50/50 dark:bg-primary-950/40 rounded-xl border border-primary-100/50 dark:border-primary-900/30 uppercase tracking-widest shadow-sm flex items-center gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-500 dark:bg-primary-400 animate-pulse" />
                      v2.4.0
                    </motion.span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 max-w-lg font-medium leading-relaxed">
                    Customize your Pigeon communication terminal credentials, security, notifications, and ambient AI.
                  </p>
                </div>
              </div>

              {/* Right side: Search + Profile Quick Access */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                {/* Floating Glass Search Input */}
                <div className="relative flex items-center w-full sm:w-64 md:w-72 group">
                  <input 
                    type="text"
                    placeholder="Search setting options..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs pl-10 pr-8 py-3 rounded-2xl border border-gray-150 dark:border-slate-800 bg-white/80 dark:bg-[#070b13]/80 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all font-medium placeholder-gray-400 shadow-inner"
                  />
                  <FiSearch size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-primary-500 transition-colors pointer-events-none" />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-650 dark:hover:text-gray-250 transition-colors"
                    >
                      <FiX size={14} />
                    </button>
                  )}
                </div>

                {/* Profile Quick Access */}
                <motion.div 
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setActiveTab('account'); setSearchQuery(''); }}
                  className="flex items-center gap-3 pl-3 pr-4 py-2 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-gray-150 dark:border-slate-855 rounded-2xl shadow-sm cursor-pointer select-none shrink-0"
                >
                  {renderAvatar("w-8 h-8", "text-[10px] font-black")}
                  <div className="text-left">
                    <div className="text-[11px] font-bold text-gray-850 dark:text-white leading-none">
                      {username || user?.username || 'Pigeon User'}
                    </div>
                    <div className="text-[9px] text-gray-450 font-semibold mt-0.5 leading-none">
                      {email || user?.email || 'user@pigeon.im'}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Subtle bottom glow bar */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary-500 to-primary-600 opacity-60 pointer-events-none" />
          </div>

          {/* Premium Navigation Tabs with Framer Motion Sliding Indicator (Mobile/Tablet Only) */}
          <div className="flex lg:hidden gap-2.5 overflow-x-auto whitespace-nowrap scrollbar-none py-2 relative z-10 px-0.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id && !searchQuery;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSearchQuery('');
                  }}
                  className={`relative flex items-center gap-3 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer select-none shrink-0 group ${
                    isActive 
                      ? 'text-white' 
                      : 'bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-gray-150 dark:border-slate-850 text-gray-500 hover:text-gray-800 dark:text-slate-400 dark:hover:text-slate-200 hover:border-gray-200 dark:hover:border-slate-800 shadow-sm'
                  }`}
                >
                  {/* Framer Motion sliding background */}
                  {isActive && (
                    <motion.div 
                      layoutId="activeSettingsTabMobile"
                      className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-500 rounded-2xl shadow-lg shadow-primary-500/20"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}

                  <span className="relative z-10 transition-transform duration-300 group-hover:scale-110">
                    <Icon size={14} className="stroke-[2.5]" />
                  </span>
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Desktop Split Layout Pane Container */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden h-full w-full">
          
          {/* Left Side: Scrollable Settings Content Area */}
          <div className="flex-1 bg-[#f8fafc] dark:bg-[#070c14] overflow-y-auto p-6 lg:p-10 h-full custom-scrollbar relative flex flex-col">

          <AnimatePresence mode="wait">
            
            {/* Search mode active view */}
            {searchQuery ? (
              <motion.div
                key="search-mode"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-primary-50/50 dark:bg-primary-950/20 border border-primary-100/60 dark:border-primary-900/30 p-4.5 rounded-[1.5rem] flex items-center gap-3.5 select-none">
                  <FiSearch className="text-primary-600 dark:text-primary-400" size={18} />
                  <div>
                    <h3 className="text-xs font-black text-primary-800 dark:text-primary-300 uppercase tracking-widest">
                      Search Directory Active
                    </h3>
                    <p className="text-[10.5px] text-primary-600/80 dark:text-primary-400/80 mt-0.5">
                      Showing matches matching your query across all configuration cards
                    </p>
                  </div>
                </div>

                {/* 1. Account details search matches */}
                {matchesSearch('Account Details Info', 'Username email phone number status bio profile', 'personal username phone email bio') && (
                  <div className="bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-slate-800/80 rounded-[2rem] p-6 shadow-sm">
                    <div className="flex items-center gap-3 border-b border-gray-100 dark:border-slate-800/60 pb-3 mb-5">
                      <FiUser size={16} className="text-primary-600 dark:text-primary-400" />
                      <h4 className="text-xs font-black text-gray-800 dark:text-white uppercase tracking-wider">Account Credentials</h4>
                    </div>
                    {/* Render form */}
                    <form onSubmit={handleSaveAccount} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[9.5px] font-bold text-gray-400 uppercase mb-1">Username</label>
                        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-150 dark:border-slate-800 bg-gray-50/40 dark:bg-slate-950/40 text-gray-900 dark:text-white" required />
                      </div>
                      <div>
                        <label className="block text-[9.5px] font-bold text-gray-400 uppercase mb-1">Email Address</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-150 dark:border-slate-800 bg-gray-50/40 dark:bg-slate-950/40 text-gray-900 dark:text-white" required />
                      </div>
                      <div>
                        <label className="block text-[9.5px] font-bold text-gray-400 uppercase mb-1">Phone Number</label>
                        <input type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-150 dark:border-slate-800 bg-gray-50/40 dark:bg-slate-950/40 text-gray-900 dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-[9.5px] font-bold text-gray-400 uppercase mb-1">Custom Status Message</label>
                        <input type="text" value={customStatus} onChange={(e) => setCustomStatus(e.target.value)} className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-150 dark:border-slate-800 bg-gray-50/40 dark:bg-slate-950/40 text-gray-900 dark:text-white" />
                      </div>
                      <div className="md:col-span-2">
                        <button type="submit" className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md shadow-primary-500/10">Save Account Details</button>
                      </div>
                    </form>
                  </div>
                )}

                {/* 2. Privacy matches */}
                {matchesSearch('Privacy Blocked Receipts Disappearing', 'Blocked contacts disappearing messages receipts', 'privacy blocked receipts disappearing contacts') && (
                  <div className="bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-slate-800/80 rounded-[2rem] p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-3 border-b border-gray-100 dark:border-slate-800/60 pb-3 mb-2">
                      <FiShield size={16} className="text-sky-600 dark:text-sky-400" />
                      <h4 className="text-xs font-black text-gray-800 dark:text-white uppercase tracking-wider">Privacy Center</h4>
                    </div>
                    <div className="flex justify-between items-center bg-gray-50/40 dark:bg-slate-950/20 p-3 rounded-xl">
                      <span className="text-xs font-bold text-gray-700 dark:text-slate-300">Read Receipts Status</span>
                      <button onClick={() => handleToggleReadReceipts(!readReceipts)} className={`w-10 h-5.5 rounded-full relative transition-colors ${readReceipts ? 'bg-primary-600' : 'bg-gray-300 dark:bg-slate-700'}`}>
                        <span className={`w-3.5 h-3.5 bg-white rounded-full absolute top-1 transition-all ${readReceipts ? 'left-[21px]' : 'left-[3px]'}`} />
                      </button>
                    </div>
                  </div>
                )}

                {/* 3. Notification alerts matches */}
                {matchesSearch('Notifications Alert Previews Sound Tones', 'Sound tones message group calls ringtones show previews', 'notifications alert tones sounds preview') && (
                  <div className="bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-slate-800/80 rounded-[2rem] p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-3 border-b border-gray-100 dark:border-slate-800/60 pb-3 mb-2">
                      <FiBell size={16} className="text-indigo-600 dark:text-indigo-400" />
                      <h4 className="text-xs font-black text-gray-800 dark:text-white uppercase tracking-wider">Sound Alerts & Notifications</h4>
                    </div>
                    <div className="flex justify-between items-center bg-gray-50/40 dark:bg-slate-950/20 p-3 rounded-xl">
                      <span className="text-xs font-bold text-gray-700 dark:text-slate-300">Message Previews</span>
                      <button onClick={() => handleToggleShowPreviews(!showPreviews)} className={`w-10 h-5.5 rounded-full relative transition-colors ${showPreviews ? 'bg-primary-600' : 'bg-gray-300 dark:bg-slate-700'}`}>
                        <span className={`w-3.5 h-3.5 bg-white rounded-full absolute top-1 transition-all ${showPreviews ? 'left-[21px]' : 'left-[3px]'}`} />
                      </button>
                    </div>
                  </div>
                )}

                {/* 4. Data storage matches */}
                {matchesSearch('Data & Storage Auto-Download Network Cellular', 'Telemetry session usage progress auto download photos video audio', 'data storage auto-download cellular network wifi') && (
                  <div className="bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-slate-800/80 rounded-[2rem] p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-3 border-b border-gray-100 dark:border-slate-800/60 pb-3 mb-2">
                      <FiActivity size={16} className="text-teal-600 dark:text-teal-400" />
                      <h4 className="text-xs font-black text-gray-800 dark:text-white uppercase tracking-wider">Network Telemeter</h4>
                    </div>
                    <p className="text-xs text-gray-550 dark:text-gray-400 leading-normal">
                      Search match: Check storage limits, telemetry bytes transmitted, and cellular preferences inside the "Data & Storage" navigation tab.
                    </p>
                  </div>
                )}

                {/* 5. Help FAQ matches */}
                {matchesSearch('Help FAQs FAQ Contact Us developer', 'Help FAQs expand Contact support ticket', 'help support contact faq guidelines policy') && (
                  <div className="bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-slate-800/80 rounded-[2rem] p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-3 border-b border-gray-100 dark:border-slate-800/60 pb-3 mb-2">
                      <FiSliders size={16} className="text-amber-600 dark:text-amber-400" />
                      <h4 className="text-xs font-black text-gray-800 dark:text-white uppercase tracking-wider">Help Accordion Support</h4>
                    </div>
                    <p className="text-xs text-gray-550 dark:text-gray-400 leading-normal">
                      Search match: Contact developer, submit logs tickets, and view terms FAQs. Go to "Help & FAQ Support" nav tab for complete forms.
                    </p>
                  </div>
                )}

                {/* 6. Appearance matches */}
                {matchesSearch('Appearance Theme Dark Light Cyberpunk Accent Colors Font Size', 'theme profile accent color font size typography scale', 'appearance themes darkmode colors fonts') && (
                  <div className="bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-slate-800/80 rounded-[2rem] p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-3 border-b border-gray-100 dark:border-slate-800/60 pb-3 mb-2">
                      <FiMoon size={16} className="text-purple-600 dark:text-purple-400" />
                      <h4 className="text-xs font-black text-gray-800 dark:text-white uppercase tracking-wider">Appearance & Themes</h4>
                    </div>
                    <p className="text-xs text-gray-550 dark:text-gray-400 leading-normal">
                      Search match: Theme cards, accent highlights, and font typography scale inside the "Appearance" tab.
                    </p>
                  </div>
                )}

                {/* 7. Connected Devices matches */}
                {matchesSearch('Connected Devices Sessions Terminal Revoke', 'Active sessions devices revoke terminal safari browser iphone', 'connected devices sessions terminals revoke') && (
                  <div className="bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-slate-800/80 rounded-[2rem] p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-3 border-b border-gray-100 dark:border-slate-800/60 pb-3 mb-2">
                      <FiSmartphone size={16} className="text-sky-600 dark:text-sky-400" />
                      <h4 className="text-xs font-black text-gray-800 dark:text-white uppercase tracking-wider">Connected Devices</h4>
                    </div>
                    <p className="text-xs text-gray-550 dark:text-gray-400 leading-normal">
                      Search match: Active terminal sessions, IP logs, and session revoke inside the "Connected Devices" tab.
                    </p>
                  </div>
                )}

                {/* 8. AI Preferences matches */}
                {matchesSearch('AI Preferences Smart Reply Summarizer Tone Persona', 'AI smart reply summarizer tone enhancer persona agent', 'ai preferences smart replies summaries tone') && (
                  <div className="bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-slate-800/80 rounded-[2rem] p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-3 border-b border-gray-100 dark:border-slate-800/60 pb-3 mb-2">
                      <FiCpu size={16} className="text-purple-600 dark:text-indigo-400" />
                      <h4 className="text-xs font-black text-gray-800 dark:text-white uppercase tracking-wider">AI Preferences</h4>
                    </div>
                    <p className="text-xs text-gray-550 dark:text-gray-400 leading-normal">
                      Search match: AI smart replies, chat summaries, tone enhancer, and persona controls inside the "AI Preferences" tab.
                    </p>
                  </div>
                )}

                {/* If nothing matches search query */}
                {!matchesSearch('Account Details Info', 'Username email phone number status bio profile', 'personal username phone email bio') &&
                 !matchesSearch('Privacy Blocked Receipts Disappearing', 'Blocked contacts disappearing messages receipts', 'privacy blocked receipts disappearing contacts') &&
                 !matchesSearch('Notifications Alert Previews Sound Tones', 'Sound tones message group calls ringtones show previews', 'notifications alert tones sounds preview') &&
                 !matchesSearch('Data & Storage Auto-Download Network Cellular', 'Telemetry session usage progress auto download photos video audio', 'data storage auto-download cellular network wifi') &&
                 !matchesSearch('Help FAQs FAQ Contact Us developer', 'Help FAQs expand Contact support ticket', 'help support contact faq guidelines policy') &&
                 !matchesSearch('Appearance Theme Dark Light Cyberpunk Accent Colors Font Size', 'theme profile accent color font size typography scale', 'appearance themes darkmode colors fonts') &&
                 !matchesSearch('Connected Devices Sessions Terminal Revoke', 'Active sessions devices revoke terminal safari browser iphone', 'connected devices sessions terminals revoke') &&
                 !matchesSearch('AI Preferences Smart Reply Summarizer Tone Persona', 'AI smart reply summarizer tone enhancer persona agent', 'ai preferences smart replies summaries tone') && (
                   <div className="text-center py-16 bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-slate-800/80 rounded-[2.5rem] p-6 shadow-sm select-none">
                     <FiInfo size={32} className="mx-auto text-gray-300 mb-3" />
                     <h3 className="font-extrabold text-[15px] text-gray-850 dark:text-white">No matches found</h3>
                     <p className="text-xs text-gray-400 mt-1 max-w-[280px] mx-auto leading-relaxed">
                       We couldn't locate any settings configurations matching "{searchQuery}"
                     </p>
                   </div>
                 )}
              </motion.div>
            ) : (
              
              // =========================================================
              // ACTIVE TAB DETAILED CONFIGURATION VIEWS
              // =========================================================
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.18 }}
                className="space-y-6 max-w-4xl"
              >
                
                {/* 1. TABS CONTENT: ACCOUNT DETAILS */}
                {activeTab === 'account' && (
                  <div className="space-y-6">

                    {/* Integrated Profile Form Card with Avatar Edit (No double headers!) */}
                    <div className="bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-slate-850 rounded-[2.5rem] p-0 shadow-sm overflow-hidden space-y-6">
                      
                      {/* Integrated High-Fidelity Avatar Edit Zone at the top of My Account */}
                      <div className="relative">
                        {/* Profile Banner */}
                        <div className="relative w-full h-32 bg-gradient-to-r from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-800 overflow-hidden shadow-inner flex items-center justify-center select-none">
                          {isPremium && (
                            <div className="absolute inset-0 premium-shimmer-border opacity-20 mix-blend-overlay animate-pulse-slow" />
                          )}
                          <div className="absolute top-4 right-4 z-20">
                            {isPremium ? (
                              <span className="px-2.5 py-0.5 bg-amber-500 text-white text-[8px] font-black uppercase rounded-full shadow-sm tracking-wider flex items-center gap-0.5 shadow-amber-500/20">
                                <FiStar size={8} className="fill-current animate-spin-slow" /> Premium
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-white/20 backdrop-blur-md text-white text-[8px] font-bold uppercase rounded-full tracking-wide">
                                Standard
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Avatar Zone (Overlapping the banner) */}
                        <div className="flex flex-col items-center -mt-16 pb-4 mb-2 space-y-2 relative">
                          {/* Camera edit ring circle avatar */}
                          <div className="relative group cursor-pointer shrink-0 z-10">
                            <div className={`p-1 rounded-full transition-transform duration-300 ${isPremium ? 'premium-shimmer-border animate-pulse-slow shadow-lg shadow-amber-500/10' : 'bg-white dark:bg-slate-900 border border-gray-200/50'}`}>
                              {renderAvatar("w-28 h-28", "text-4xl font-black")}
                            </div>
                            
                            <button 
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="absolute bottom-1 right-1 w-9 h-9 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center justify-center shadow-lg transition-all scale-95 hover:scale-100 cursor-pointer z-20 border-2 border-white dark:border-slate-900"
                              title="Upload Avatar Image"
                            >
                              <FiCamera size={15} />
                            </button>
                          </div>
                          
                          <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleAvatarUpload}
                            accept="image/*"
                            className="hidden"
                          />
                        </div>
                      </div>

                      {/* Configurations Header label (With padding to match the card interior) */}
                      <div className="flex items-center gap-3 border-b border-gray-50 dark:border-slate-805 pb-4 px-6 lg:px-8">
                        <FiSettings size={18} className="text-primary-600 dark:text-primary-400" />
                        <div>
                          <h3 className="text-sm font-extrabold text-gray-800 dark:text-white leading-normal">
                            Personal Configurations
                          </h3>
                          <p className="text-[10px] text-gray-400 mt-0.5">Modify username, phone, status alert, and bio summaries</p>
                        </div>
                      </div>

                      <form onSubmit={handleSaveAccount} className="grid grid-cols-1 md:grid-cols-2 gap-5 px-6 lg:px-8 pb-6 lg:pb-8">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">
                            Username
                          </label>
                          <input 
                            type="text" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full text-xs px-4 py-3 rounded-xl border border-gray-150 dark:border-slate-800 bg-gray-50/40 dark:bg-slate-950/40 text-gray-850 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">
                            Email Address
                          </label>
                          <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full text-xs px-4 py-3 rounded-xl border border-gray-150 dark:border-slate-800 bg-gray-50/40 dark:bg-slate-950/40 text-gray-855 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">
                            Phone Number
                          </label>
                          <input 
                            type="tel" 
                            placeholder="e.g. +91 98765 43210"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="w-full text-xs px-4 py-3 rounded-xl border border-gray-150 dark:border-slate-800 bg-gray-50/40 dark:bg-slate-950/40 text-gray-855 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">
                            Custom Status Alert
                          </label>
                          <input 
                            type="text" 
                            placeholder="In a meeting / coding..."
                            value={customStatus}
                            onChange={(e) => setCustomStatus(e.target.value)}
                            className="w-full text-xs px-4 py-3 rounded-xl border border-gray-150 dark:border-slate-800 bg-gray-50/40 dark:bg-slate-950/40 text-gray-855 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                          />
                        </div>

                        {/* Status Presence selection dropdown */}
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">
                            Online Status Presence
                          </label>
                          <select 
                            value={presence} 
                            onChange={(e) => setPresence(e.target.value)}
                            className="w-full text-xs px-3.5 py-3 rounded-xl border border-gray-150 dark:border-slate-800 bg-gray-50/40 dark:bg-slate-950/40 text-gray-850 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                          >
                            <option value="online">Online (Available)</option>
                            <option value="away">Away (Idle)</option>
                            <option value="dnd">Do Not Disturb (Mute calls)</option>
                            <option value="offline">Offline (Invisible)</option>
                          </select>
                        </div>

                        {/* Shimmer premium card toggle */}
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">
                            Premium Shimmer Mode
                          </label>
                          <div className="flex justify-between items-center px-4 py-2.5 rounded-xl border border-gray-150 dark:border-slate-800 bg-gray-50/40 dark:bg-slate-950/40 select-none">
                            <span className="text-xs font-semibold text-gray-650 dark:text-gray-300">Shimmer Badge Active</span>
                            <button 
                              type="button"
                              onClick={() => handleTogglePremium(!isPremium)}
                              className={`w-10 h-5.5 rounded-full transition-colors relative flex items-center shrink-0 ${isPremium ? 'bg-amber-500' : 'bg-gray-300 dark:bg-slate-750'}`}
                            >
                              <span className={`w-3.5 h-3.5 bg-white rounded-full absolute transition-all ${isPremium ? 'left-[21px]' : 'left-[3px]'}`} />
                            </button>
                          </div>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-505 uppercase tracking-wider mb-1.5">
                            Biography Summary Description
                          </label>
                          <textarea 
                            rows={3}
                            value={bio}
                            placeholder="Write a brief profile description..."
                            onChange={(e) => setBio(e.target.value)}
                            className="w-full text-xs px-4 py-3 rounded-xl border border-gray-150 dark:border-slate-800 bg-gray-50/40 dark:bg-slate-950/40 text-gray-855 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-none"
                          />
                        </div>

                        <div className="md:col-span-2 flex justify-end">
                          <button 
                            type="submit" 
                            disabled={saving}
                            className="px-6 py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-extrabold uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-md shadow-primary-500/10 cursor-pointer transition-colors"
                          >
                            {saving ? 'Saving...' : 'Save Profile Changes'}
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Change Password Card */}
                    <div className="bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-slate-850 rounded-[2.5rem] p-6 lg:p-8 shadow-sm space-y-6">
                      <div className="flex items-center gap-3 border-b border-gray-50 dark:border-slate-800/50 pb-4">
                        <FiLock size={18} className="text-[#1d70b8] dark:text-sky-400" />
                        <div>
                          <h3 className="text-sm font-extrabold text-gray-800 dark:text-white leading-normal">
                            Security Credentials Update
                          </h3>
                          <p className="text-[10px] text-gray-400 mt-0.5">Maintain passwords for account access authorization safety</p>
                        </div>
                      </div>

                      <form onSubmit={handleUpdatePassword} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-[9.5px] font-bold text-gray-400 uppercase mb-1">New Password</label>
                          <input 
                            type="password" 
                            placeholder="At least 6 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full text-xs px-4 py-3 rounded-xl border border-gray-150 dark:border-slate-800 bg-gray-50/40 dark:bg-slate-950/40 text-gray-900 dark:text-white focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[9.5px] font-bold text-gray-400 uppercase mb-1">Confirm New Password</label>
                          <input 
                            type="password" 
                            placeholder="Repeat new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full text-xs px-4 py-3 rounded-xl border border-gray-150 dark:border-slate-800 bg-gray-50/40 dark:bg-slate-950/40 text-gray-900 dark:text-white focus:outline-none"
                          />
                        </div>

                        <div className="md:col-span-2 flex justify-end">
                          <button 
                            type="submit" 
                            className="px-5 py-3 border border-gray-150 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                          >
                            Update Credentials Password
                          </button>
                        </div>
                      </form>
                    </div>

                  </div>
                )}

                {/* 2. TABS CONTENT: PRIVACY CENTER */}
                {activeTab === 'privacy' && (
                  <div className="space-y-6">
                    
                    {/* Header */}
                    <div className="bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-slate-855 p-6 rounded-[2.5rem] shadow-sm">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 bg-sky-100/80 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 rounded-2xl flex items-center justify-center shadow-sm">
                          <FiShield size={22} className="stroke-[2.5]" />
                        </div>
                        <div>
                          <h2 className="text-lg font-black text-gray-900 dark:text-white leading-normal">
                            Privacy Center
                          </h2>
                          <p className="text-[11px] text-gray-400 mt-0.5">Toggle receipts visibility, disappearance timers and restricted blocked lists</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Left Privacy toggles panel */}
                      <div className="space-y-6">
                        
                        {/* Read Receipts */}
                        <div className="bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-slate-855 p-6 rounded-[2.5rem] shadow-sm space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-xs font-extrabold text-gray-800 dark:text-gray-200">Read Receipts Visibility</h4>
                              <p className="text-[10px] text-gray-400 leading-normal mt-1 pr-4">
                                Allow other members inside direct messaging channels to review when messages have been read
                              </p>
                            </div>
                            <button 
                              onClick={() => handleToggleReadReceipts(!readReceipts)}
                              className={`w-11 h-6 rounded-full transition-colors relative flex items-center shadow-inner shrink-0 ${readReceipts ? 'bg-primary-600' : 'bg-gray-300 dark:bg-slate-700'}`}
                            >
                              <span className={`w-4 h-4 bg-white rounded-full absolute transition-all ${readReceipts ? 'left-[23px]' : 'left-[4px]'}`} />
                            </button>
                          </div>
                        </div>

                        {/* Disappearing timer */}
                        <div className="bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-slate-855 p-6 rounded-[2.5rem] shadow-sm space-y-4">
                          <div>
                            <h4 className="text-xs font-extrabold text-gray-800 dark:text-gray-200">Disappearing Messages</h4>
                            <p className="text-[10px] text-gray-405 leading-normal mt-1 pr-2">
                              Keep communication history clean by automatically purging chat threads after set periods
                            </p>
                          </div>
                          
                          <div className="grid grid-cols-4 gap-2 pt-1 select-none">
                            {['off', '24h', '7d', '90d'].map((mode) => (
                              <button 
                                type="button"
                                key={mode}
                                onClick={() => handleSelectDisappearing(mode)}
                                className={`px-2.5 py-2.5 rounded-xl border text-center font-extrabold text-[10px] transition-all uppercase cursor-pointer ${
                                  disappearingMessages === mode 
                                    ? 'bg-primary-50 border-primary-500 text-primary-600 dark:bg-primary-950/30 dark:border-primary-400 dark:text-primary-400' 
                                    : 'bg-white border-gray-150 dark:bg-slate-900 dark:border-slate-800 text-gray-400 hover:border-gray-300 dark:hover:border-slate-700'
                                }`}
                              >
                                {mode === 'off' ? 'Off' : mode}
                              </button>
                            ))}
                          </div>
                        </div>

                      </div>

                      {/* Right Blocked Directory Panel */}
                      <div className="bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-slate-855 p-6 rounded-[2.5rem] shadow-sm flex flex-col h-full justify-between">
                        
                        <div className="space-y-3.5">
                          <div className="flex justify-between items-center border-b border-gray-55 dark:border-slate-800/60 pb-3">
                            <div>
                              <h4 className="text-xs font-extrabold text-gray-800 dark:text-gray-200">Blocked Contacts Directory</h4>
                              <p className="text-[10px] text-gray-450 mt-0.5">Mute direct chats & voice calls signaling</p>
                            </div>
                            <button 
                              onClick={() => setIsAddingBlock(!isAddingBlock)}
                              className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 dark:bg-slate-950/40 dark:hover:bg-slate-950/90 border border-gray-150 dark:border-slate-800 text-[10px] font-bold rounded-xl text-gray-700 dark:text-gray-250 flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              {isAddingBlock ? 'Done' : <><FiPlus size={11} /><span>Add User</span></>}
                            </button>
                          </div>
                        </div>

                        {/* List directory container */}
                        <div className="min-h-[170px] max-h-[220px] overflow-y-auto space-y-2 pr-1 custom-scrollbar flex-1 mt-4">
                          {isAddingBlock ? (
                            allUsers.length === 0 ? (
                              <p className="text-center text-[10px] text-gray-405 py-4">No other platform users listed.</p>
                            ) : (
                              allUsers.map((item) => {
                                const isBlocked = blockedList.includes(item._id);
                                return (
                                  <div key={item._id} className="flex justify-between items-center p-2.5 rounded-xl bg-gray-50/40 dark:bg-slate-950/20 border border-gray-100/50 dark:border-slate-850 text-xs">
                                    <span className="font-semibold text-gray-800 dark:text-slate-200">{item.username}</span>
                                    <button 
                                      type="button"
                                      onClick={() => handleToggleBlockUser(item._id, item.username)}
                                      className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase cursor-pointer transition-all ${
                                        isBlocked 
                                          ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400' 
                                          : 'bg-red-50 text-red-650 dark:bg-red-950/30 dark:text-red-400'
                                      }`}
                                    >
                                      {isBlocked ? 'Blocked' : 'Block'}
                                    </button>
                                  </div>
                                );
                              })
                            )
                          ) : (
                            blockedList.length === 0 ? (
                              <div className="text-center text-[10px] text-gray-400 py-10">
                                <FiInfo size={22} className="mx-auto mb-2 text-gray-300" />
                                <span>No restricted contacts are currently listed.</span>
                              </div>
                            ) : (
                              blockedList.map((blockedId) => {
                                const foundUser = allUsers.find(x => x._id === blockedId);
                                const name = foundUser ? foundUser.username : `User ID: ${blockedId.slice(-6)}`;
                                return (
                                  <div key={blockedId} className="flex justify-between items-center p-3 rounded-xl bg-gray-50/40 dark:bg-slate-950/20 border border-gray-100/50 dark:border-slate-850 text-xs">
                                    <span className="font-semibold text-gray-800 dark:text-slate-200">{name}</span>
                                    <button 
                                      type="button"
                                      onClick={() => handleToggleBlockUser(blockedId, name)}
                                      className="text-[9px] text-red-500 hover:text-red-650 font-black uppercase flex items-center gap-1 cursor-pointer transition-colors"
                                    >
                                      <FiTrash2 size={11} />
                                      <span>Unblock</span>
                                    </button>
                                  </div>
                                );
                              })
                            )
                          )}
                        </div>

                      </div>

                    </div>

                  </div>
                )}

                {/* 3. TABS CONTENT: NOTIFICATION ALERTS */}
                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    
                    {/* Header */}
                    <div className="bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-slate-855 p-6 rounded-[2.5rem] shadow-sm">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 bg-indigo-100/80 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center shadow-sm">
                          <FiBell size={22} className="stroke-[2.5]" />
                        </div>
                        <div>
                          <h2 className="text-lg font-black text-gray-900 dark:text-white leading-normal">
                            Notification Tones
                          </h2>
                          <p className="text-[11px] text-gray-400 mt-0.5">Modify preview banners visibility and locally synthesize ringtone audio testers</p>
                        </div>
                      </div>
                    </div>

                    {/* Previews Screen toggle card */}
                    <div className="bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-slate-855 p-6 rounded-[2.5rem] shadow-sm">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-xs font-extrabold text-gray-800 dark:text-gray-200">Show Messaging Previews</h4>
                          <p className="text-[10px] text-gray-405 leading-normal mt-1">
                            Enable floating push banners alerts on-screen with message text body previews
                          </p>
                        </div>
                        <button 
                          onClick={() => handleToggleShowPreviews(!showPreviews)}
                          className={`w-11 h-6 rounded-full transition-colors relative flex items-center shadow-inner shrink-0 ${showPreviews ? 'bg-primary-600' : 'bg-gray-300 dark:bg-slate-700'}`}
                        >
                          <span className={`w-4 h-4 bg-white rounded-full absolute transition-all ${showPreviews ? 'left-[23px]' : 'left-[4px]'}`} />
                        </button>
                      </div>
                    </div>

                    {/* Tones synthesis grids */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Message Alert */}
                      <div className="bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-slate-855 p-6 rounded-[2.5rem] shadow-sm space-y-4">
                        <label className="block text-[9.5px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">
                          Message Alerts
                        </label>
                        <div className="space-y-3.5 select-none">
                          <select 
                            value={messageSound}
                            onChange={(e) => { setMessageSound(e.target.value); playSynthSound(e.target.value); }}
                            className="w-full text-xs px-3.5 py-3 rounded-xl border border-gray-150 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-950/40 text-gray-800 dark:text-white focus:outline-none"
                          >
                            <option value="chime">Chime Double</option>
                            <option value="ding">Bell Ding</option>
                            <option value="classic">Tri-tone Synth</option>
                            <option value="uplifting">Uplifting Saw</option>
                          </select>
                          
                          <button 
                            type="button"
                            onClick={() => playSynthSound(messageSound)}
                            className="w-full py-2.5 bg-primary-50 hover:bg-primary-100 dark:bg-primary-950/20 dark:hover:bg-primary-950/40 border border-primary-100/50 dark:border-primary-900/30 text-primary-600 dark:text-primary-400 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                          >
                            <FiVolume2 size={14} />
                            <span>Preview Synthesizer</span>
                          </button>
                        </div>
                      </div>

                      {/* Group alerts */}
                      <div className="bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-slate-855 p-6 rounded-[2.5rem] shadow-sm space-y-4">
                        <label className="block text-[9.5px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">
                          Group Mentions
                        </label>
                        <div className="space-y-3.5 select-none">
                          <select 
                            value={groupSound}
                            onChange={(e) => { setGroupSound(e.target.value); playSynthSound(e.target.value); }}
                            className="w-full text-xs px-3.5 py-3 rounded-xl border border-gray-150 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-950/40 text-gray-800 dark:text-white focus:outline-none"
                          >
                            <option value="ding">Bell Ding</option>
                            <option value="chime">Chime Double</option>
                            <option value="classic">Tri-tone Synth</option>
                            <option value="uplifting">Uplifting Saw</option>
                          </select>
                          
                          <button 
                            type="button"
                            onClick={() => playSynthSound(groupSound)}
                            className="w-full py-2.5 bg-primary-50 hover:bg-primary-100 dark:bg-primary-950/20 dark:hover:bg-primary-950/40 border border-primary-100/50 dark:border-primary-900/30 text-primary-600 dark:text-primary-400 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                          >
                            <FiVolume2 size={14} />
                            <span>Preview Synthesizer</span>
                          </button>
                        </div>
                      </div>

                      {/* Voice Calls */}
                      <div className="bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-slate-855 p-6 rounded-[2.5rem] shadow-sm space-y-4">
                        <label className="block text-[9.5px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">
                          Incoming Calls
                        </label>
                        <div className="space-y-3.5 select-none">
                          <select 
                            value={callSound}
                            onChange={(e) => { setCallSound(e.target.value); playSynthSound(e.target.value); }}
                            className="w-full text-xs px-3.5 py-3 rounded-xl border border-gray-150 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-950/40 text-gray-855 dark:text-white focus:outline-none"
                          >
                            <option value="melody">Melodic Ringer</option>
                            <option value="classic">Tri-tone Synth</option>
                            <option value="chime">Chime Double</option>
                            <option value="uplifting">Uplifting Saw</option>
                          </select>
                          
                          <button 
                            type="button"
                            onClick={() => playSynthSound(callSound)}
                            className="w-full py-2.5 bg-primary-50 hover:bg-primary-100 dark:bg-primary-950/20 dark:hover:bg-primary-950/40 border border-primary-100/50 dark:border-primary-900/30 text-primary-600 dark:text-primary-400 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                          >
                            <FiVolume2 size={14} />
                            <span>Preview Synthesizer</span>
                          </button>
                        </div>
                      </div>

                    </div>

                  </div>
                )}

                {/* 4. TABS CONTENT: DATA & STORAGE */}
                {activeTab === 'storage' && (
                  <div className="space-y-6">
                    
                    {/* Header */}
                    <div className="bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-slate-855 p-6 rounded-[2.5rem] shadow-sm">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 bg-teal-100/80 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-2xl flex items-center justify-center shadow-sm">
                          <FiActivity size={22} className="stroke-[2.5]" />
                        </div>
                        <div>
                          <h2 className="text-lg font-black text-gray-900 dark:text-white leading-normal">
                            Data & Storage Limits
                          </h2>
                          <p className="text-[11px] text-gray-400 mt-0.5">Track network byte telemetry indicators and configure saving files policies</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Telemetry diagnostics */}
                      <div className="bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-slate-855 p-6 rounded-[2.5rem] shadow-sm space-y-5 select-none">
                        <h4 className="text-xs font-extrabold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                          Active Telemetry diagnostics
                        </h4>
                        
                        <div className="space-y-4 pt-1">
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-xs font-bold text-gray-600 dark:text-slate-400">
                              <span>Total Transmitted (Upload)</span>
                              <span className="text-gray-850 dark:text-white">45.2 MB</span>
                            </div>
                            <div className="w-full h-2.5 bg-gray-50 dark:bg-slate-950/60 rounded-full overflow-hidden border border-gray-100 dark:border-slate-855">
                              <div className="h-full bg-primary-500 rounded-full shadow-sm" style={{ width: '35%' }} />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex justify-between text-xs font-bold text-gray-600 dark:text-slate-400">
                              <span>Total Received (Downloads)</span>
                              <span className="text-gray-850 dark:text-white">120.8 MB</span>
                            </div>
                            <div className="w-full h-2.5 bg-gray-50 dark:bg-slate-950/60 rounded-full overflow-hidden border border-gray-100 dark:border-slate-855">
                              <div className="h-full bg-teal-500 rounded-full shadow-sm" style={{ width: '70%' }} />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Toggles */}
                      <div className="bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-slate-855 p-6 rounded-[2.5rem] shadow-sm space-y-4">
                        <h4 className="text-xs font-extrabold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                          Auto-Download Preferences
                        </h4>
                        
                        <div className="space-y-2.5 pt-1 select-none">
                          {[
                            { title: 'Photos over Wi-Fi network', state: autoWifi, setState: setAutoWifi },
                            { title: 'Photos over Cellular data limits', state: autoCellular, setState: setAutoCellular },
                            { title: 'Audio recordings & voicemails', state: autoAudio, setState: setAutoAudio },
                            { title: 'Large documents & PDF attachments', state: autoDocs, setState: setAutoDocs }
                          ].map((item, index) => (
                            <div 
                              key={index}
                              onClick={() => item.setState(!item.state)}
                              className="flex justify-between items-center p-3 rounded-2xl bg-gray-50/40 dark:bg-slate-950/20 border border-gray-100/50 dark:border-slate-855 hover:bg-gray-100/40 cursor-pointer transition-colors"
                            >
                              <span className="text-xs font-semibold text-gray-700 dark:text-slate-300">
                                {item.title}
                              </span>
                              <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                                item.state 
                                  ? 'bg-primary-600 border-primary-600 text-white' 
                                  : 'border-gray-200 dark:border-slate-700 bg-transparent'
                              }`}>
                                {item.state && <FiCheck size={12} className="stroke-[3]" />}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                  </div>
                )}
                {/* 5. TABS CONTENT: APPEARANCE */}
                {activeTab === 'appearance' && (
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-slate-855 p-6 rounded-[2.5rem] shadow-sm">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 bg-purple-100/80 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center shadow-sm">
                          <FiMoon size={22} className="stroke-[2.5]" />
                        </div>
                        <div>
                          <h2 className="text-lg font-black text-gray-900 dark:text-white leading-normal">
                            Appearance & Themes
                          </h2>
                          <p className="text-[11px] text-gray-400 mt-0.5">Customize your Pigeon aesthetic with themes, accent colors, and typography scale</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Theme Selector Cards */}
                      <div className="bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-slate-855 p-6 rounded-[2.5rem] shadow-sm space-y-4">
                        <h4 className="text-xs font-black text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                          Select Theme Profile
                        </h4>
                        
                        <div className="grid grid-cols-1 gap-3.5">
                          {/* Light */}
                          <motion.div 
                            whileHover={{ scale: 1.01 }}
                            onClick={() => handleSelectTheme('light', 'Aura Light')}
                            className={`relative p-4 rounded-2xl border-2 cursor-pointer flex items-center justify-between transition-all overflow-hidden ${
                              selectedTheme === 'light' 
                                ? 'border-primary-500 bg-primary-50/20 dark:bg-primary-950/10' 
                                : 'border-gray-100 dark:border-slate-850 hover:border-gray-200 dark:hover:border-slate-800 bg-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-3 relative z-10">
                              <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center">
                                <FiSun size={16} />
                              </div>
                              <div className="text-left">
                                <p className="text-xs font-bold text-gray-805 dark:text-white leading-none">Aura Light</p>
                                <p className="text-[9.5px] text-gray-400 mt-1 font-medium">Clean white spaces, soft subtle gray borders</p>
                              </div>
                            </div>
                            {selectedTheme === 'light' && <FiCheck className="text-primary-500 z-10" size={16} />}
                          </motion.div>

                          {/* Dark */}
                          <motion.div 
                            whileHover={{ scale: 1.01 }}
                            onClick={() => handleSelectTheme('dark', 'Midnight Obsidian')}
                            className={`relative p-4 rounded-2xl border-2 cursor-pointer flex items-center justify-between transition-all overflow-hidden ${
                              selectedTheme === 'dark' 
                                ? 'border-primary-500 bg-primary-50/20 dark:bg-primary-950/10' 
                                : 'border-gray-100 dark:border-slate-850 hover:border-gray-200 dark:hover:border-slate-800 bg-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-3 relative z-10">
                              <div className="w-8 h-8 rounded-xl bg-slate-900 text-sky-400 flex items-center justify-center">
                                <FiMoon size={16} />
                              </div>
                              <div className="text-left">
                                <p className="text-xs font-bold text-gray-805 dark:text-white leading-none">Midnight Obsidian</p>
                                <p className="text-[9.5px] text-gray-400 mt-1 font-medium">Deep obsidian blue dark space, neon glows</p>
                              </div>
                            </div>
                            {selectedTheme === 'dark' && <FiCheck className="text-primary-500 z-10" size={16} />}
                          </motion.div>

                          {/* Cyberpunk */}
                          <motion.div 
                            whileHover={{ scale: 1.01 }}
                            onClick={() => handleSelectTheme('cyberpunk', 'Cyberpunk Dusk')}
                            className={`relative p-4 rounded-2xl border-2 cursor-pointer flex items-center justify-between transition-all overflow-hidden ${
                              selectedTheme === 'cyberpunk' 
                                ? 'border-primary-500 bg-primary-950/10' 
                                : 'border-gray-100 dark:border-slate-855 hover:border-gray-200 dark:hover:border-slate-800 bg-transparent'
                            }`}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-50 pointer-events-none" />
                            <div className="flex items-center gap-3 relative z-10">
                              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-500 to-pink-500 text-white flex items-center justify-center">
                                <FiCpu size={16} />
                              </div>
                              <div className="text-left">
                                <p className="text-xs font-bold text-gray-855 dark:text-white leading-none">Cyberpunk Dusk</p>
                                <p className="text-[9.5px] text-gray-400 mt-1 font-medium">Futuristic cyberpunk purple glass aesthetic</p>
                              </div>
                            </div>
                            {selectedTheme === 'cyberpunk' && <FiCheck className="text-primary-500 z-10" size={16} />}
                          </motion.div>
                        </div>
                      </div>

                      {/* Accent Colors & Typography */}
                      <div className="space-y-6">
                        {/* Accent Palette */}
                        <div className="bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-slate-855 p-6 rounded-[2.5rem] shadow-sm space-y-4">
                          <h4 className="text-xs font-black text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                            Brand Accent Highlights
                          </h4>
                          <p className="text-[10px] text-gray-400 leading-normal pr-4">
                            Apply custom highlight colors across buttons and badges
                          </p>

                          <div className="flex items-center gap-3 pt-2">
                            {[
                              { id: 'indigo', name: 'Premium Indigo', class: 'bg-indigo-600 shadow-indigo-500/20' },
                              { id: 'emerald', name: 'Fresh Emerald', class: 'bg-emerald-500 shadow-emerald-500/20' },
                              { id: 'rose', name: 'Dynamic Rose', class: 'bg-rose-500 shadow-rose-500/20' },
                              { id: 'amber', name: 'Star Amber', class: 'bg-amber-500 shadow-amber-500/20' }
                            ].map((color) => (
                              <motion.button 
                                type="button"
                                key={color.id}
                                whileHover={{ scale: 1.15 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleSelectAccentColor(color.id, color.name)}
                                className={`w-8 h-8 rounded-full ${color.class} shadow-lg relative flex items-center justify-center cursor-pointer`}
                                title={color.name}
                              >
                                {accentColor === color.id && (
                                  <span className="w-3 h-3 bg-white rounded-full shadow-inner" />
                                )}
                              </motion.button>
                            ))}
                          </div>
                        </div>

                        {/* Typography Slider */}
                        <div className="bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-slate-855 p-6 rounded-[2.5rem] shadow-sm space-y-4">
                          <h4 className="text-xs font-black text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                            Typography Text Scaling
                          </h4>
                          
                          <div className="space-y-4 pt-1">
                            <div className="flex justify-between text-xs font-bold text-gray-650 dark:text-slate-400 select-none">
                              <span>Font Scale: {fontSize}px</span>
                              <span className="text-[10px] px-2 py-0.5 bg-gray-50 dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-lg">
                                {fontSize <= 12 ? 'Compact' : fontSize >= 16 ? 'Expanded' : 'Standard'}
                              </span>
                            </div>

                            <input 
                              type="range" 
                              min="11" 
                              max="18" 
                              value={fontSize}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                setFontSize(val);
                                document.documentElement.style.fontSize = `${val}px`;
                              }}
                              onMouseUp={(e) => handleSelectFontSize(parseInt(e.target.value))}
                              onTouchEnd={(e) => handleSelectFontSize(parseInt(e.target.value))}
                              className="w-full h-1.5 bg-gray-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-500 focus:outline-none"
                            />

                            {/* Live Preview */}
                            <div className="p-4 rounded-2xl bg-gray-50/50 dark:bg-slate-950/30 border border-gray-100/50 dark:border-slate-850 select-none">
                              <p className="text-[9.5px] font-bold text-gray-455 uppercase tracking-widest mb-1.5">Live Preview</p>
                              <p 
                                className="font-semibold text-gray-800 dark:text-slate-205 transition-all duration-150 leading-relaxed"
                                style={{ fontSize: `${fontSize}px` }}
                              >
                                Pigeon Node decodes signal: hello client!
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. TABS CONTENT: CONNECTED DEVICES */}
                {activeTab === 'devices' && (
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-slate-855 p-6 rounded-[2.5rem] shadow-sm">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 bg-sky-100/80 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 rounded-2xl flex items-center justify-center shadow-sm">
                          <FiSmartphone size={22} className="stroke-[2.5]" />
                        </div>
                        <div>
                          <h2 className="text-lg font-black text-gray-900 dark:text-white leading-normal">
                            Connected Devices
                          </h2>
                          <p className="text-[11px] text-gray-400 mt-0.5">Manage and revoke authorized devices currently signed into your Pigeon system</p>
                        </div>
                      </div>
                    </div>

                    {/* Active Sessions List */}
                    <div className="bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-slate-855 p-6 rounded-[2.5rem] shadow-sm space-y-5">
                      <div>
                        <h4 className="text-xs font-black text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                          Active Terminal Sessions
                        </h4>
                        <p className="text-[10px] text-gray-400 mt-1 leading-relaxed font-medium">
                          Authorized instances holding active decryption keys. Inactive terminals can be disconnected.
                        </p>
                      </div>

                      <div className="space-y-4">
                        <AnimatePresence>
                          {sessions.map((session) => (
                            <motion.div 
                              key={session.id}
                              layout
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, x: -50 }}
                              className="p-5 rounded-2xl bg-gray-50/40 dark:bg-slate-950/20 border border-gray-100/50 dark:border-slate-850 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all"
                            >
                              <div className="flex items-start gap-4">
                                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                                  session.current 
                                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-sky-400 border border-blue-100/40' 
                                    : 'bg-gray-100 text-gray-400 dark:bg-slate-900/60'
                                }`}>
                                  <FiSmartphone size={20} />
                                </div>
                                <div className="text-left space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h5 className="text-xs font-black text-gray-800 dark:text-white uppercase tracking-wider">{session.name}</h5>
                                    {session.current && (
                                      <span className="px-2 py-0.5 bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400 text-[8px] font-black rounded-md border border-green-200/30 uppercase tracking-wider animate-pulse flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 dark:bg-green-400" /> Current
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-gray-550 dark:text-slate-400 font-semibold">{session.client}</p>
                                  <div className="flex items-center gap-3 text-[9.5px] text-gray-450 dark:text-slate-500 flex-wrap">
                                    <span>IP: {session.ip}</span>
                                    <span>•</span>
                                    <span>{session.location}</span>
                                    <span>•</span>
                                    <span className="text-blue-500 font-bold">{session.active}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="shrink-0 flex sm:justify-end">
                                {session.current ? (
                                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider select-none px-4 py-2 border border-dashed border-gray-200 dark:border-slate-800 rounded-xl bg-gray-50/20 dark:bg-slate-950/10">
                                    Current Terminal
                                  </span>
                                ) : (
                                  <motion.button 
                                    type="button"
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => {
                                      setSessions(sessions.filter(s => s.id !== session.id));
                                      toast.success(`Access for ${session.name} revoked!`);
                                    }}
                                    className="px-4 py-2 border border-red-100 hover:bg-red-50/50 dark:border-red-900/40 dark:hover:bg-red-950/20 text-red-500 text-[10px] font-black uppercase rounded-xl transition-all cursor-pointer shadow-sm tracking-widest"
                                  >
                                    Revoke Access
                                  </motion.button>
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                )}

                {/* 7. TABS CONTENT: AI PREFERENCES */}
                {activeTab === 'ai' && (
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-slate-855 p-6 rounded-[2.5rem] shadow-sm relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-indigo-500/5 pointer-events-none" />
                      <div className="flex items-center gap-3.5 relative z-10">
                        <div className="w-12 h-12 bg-gradient-to-tr from-purple-500 to-indigo-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                          <FiCpu size={22} className="stroke-[2.5]" />
                        </div>
                        <div>
                          <h2 className="text-lg font-black text-gray-900 dark:text-white leading-normal">
                            AI Preferences
                          </h2>
                          <p className="text-[11px] text-gray-400 mt-0.5">Configure ambient AI engines, conversation summaries, and smart reply models</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                         {/* AI Toggles */}
                      <div className="bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-slate-855 p-6 rounded-[2.5rem] shadow-sm space-y-4">
                        <h4 className="text-xs font-black text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                          Ambient AI Modules
                        </h4>
                        
                        <div className="space-y-3.5 pt-1">
                          {/* Smart replies */}
                          <div className="p-4 rounded-2xl bg-gray-50/40 dark:bg-slate-950/20 border border-gray-100/50 dark:border-slate-850 flex items-start justify-between gap-4">
                            <div className="text-left flex-1">
                              <h5 className="text-xs font-extrabold text-gray-805 dark:text-gray-250">AI Smart Replies</h5>
                              <p className="text-[9.5px] text-gray-400 mt-1 leading-normal pr-4 font-medium">
                                Auto-generate contextual smart response pills in conversations
                              </p>
                            </div>
                            <button 
                              type="button"
                              onClick={() => handleToggleAiSmartReply(!aiSmartReply)}
                              className={`w-11 h-6 rounded-full transition-colors relative flex items-center shadow-inner shrink-0 cursor-pointer ${aiSmartReply ? 'bg-purple-600' : 'bg-gray-300 dark:bg-slate-700'}`}
                            >
                              <span className={`w-4 h-4 bg-white rounded-full absolute transition-all ${aiSmartReply ? 'left-[23px]' : 'left-[4px]'}`} />
                            </button>
                          </div>

                          {/* Chat summaries */}
                          <div className="p-4 rounded-2xl bg-gray-50/40 dark:bg-slate-950/20 border border-gray-100/50 dark:border-slate-850 flex items-start justify-between gap-4">
                            <div className="text-left flex-1">
                              <h5 className="text-xs font-extrabold text-gray-805 dark:text-gray-250">Instant Chat Summaries</h5>
                              <p className="text-[9.5px] text-gray-400 mt-1 leading-normal pr-4 font-medium">
                                Extract unread channel highlights into concise bullet summaries
                              </p>
                            </div>
                            <button 
                              type="button"
                              onClick={() => handleToggleAiSummarizer(!aiSummarizer)}
                              className={`w-11 h-6 rounded-full transition-colors relative flex items-center shadow-inner shrink-0 cursor-pointer ${aiSummarizer ? 'bg-purple-600' : 'bg-gray-300 dark:bg-slate-700'}`}
                            >
                              <span className={`w-4 h-4 bg-white rounded-full absolute transition-all ${aiSummarizer ? 'left-[23px]' : 'left-[4px]'}`} />
                            </button>
                          </div>

                          {/* Tone enhancer */}
                          <div className="p-4 rounded-2xl bg-gray-50/40 dark:bg-slate-950/20 border border-gray-100/50 dark:border-slate-850 flex items-start justify-between gap-4">
                            <div className="text-left flex-1">
                              <h5 className="text-xs font-extrabold text-gray-805 dark:text-gray-250">Writing Tone Enhancer</h5>
                              <p className="text-[9.5px] text-gray-400 mt-1 leading-normal pr-4 font-medium">
                                Analyze typing and suggest dynamic tone styling filters
                              </p>
                            </div>
                            <button 
                              type="button"
                              onClick={() => handleToggleAiToneEnhancer(!aiToneEnhancer)}
                              className={`w-11 h-6 rounded-full transition-colors relative flex items-center shadow-inner shrink-0 cursor-pointer ${aiToneEnhancer ? 'bg-purple-600' : 'bg-gray-300 dark:bg-slate-700'}`}
                            >
                              <span className={`w-4 h-4 bg-white rounded-full absolute transition-all ${aiToneEnhancer ? 'left-[23px]' : 'left-[4px]'}`} />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* AI Persona Selector */}
                      <div className="bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-slate-855 p-6 rounded-[2.5rem] shadow-sm space-y-4 flex flex-col justify-between">
                        <div>
                          <h4 className="text-xs font-black text-gray-855 dark:text-gray-200 uppercase tracking-wider">
                            Pigeon AI Agent Persona
                          </h4>
                          <p className="text-[10px] text-gray-450 mt-1 leading-relaxed font-medium">
                            Determine the tone and personality style of your AI suggestions engine.
                          </p>
                        </div>

                        <div className="space-y-3 pt-1">
                          {[
                            { id: 'concierge', title: 'Sleek Concierge', desc: 'Neutral, professional, clean precision' },
                            { id: 'nexus', title: 'Cyberpunk Nexus', desc: 'Sarcastic, high-tech, futuristic wits' },
                            { id: 'zen', title: 'Zen Guru', desc: 'Calming, concise, minimalist guidance' }
                          ].map((persona) => (
                            <motion.div 
                              whileHover={{ scale: 1.015 }}
                              onClick={() => handleSelectAiPersonality(persona.id, persona.title)}
                              key={persona.id}
                              className={`relative p-3.5 rounded-xl border-2 cursor-pointer flex items-center justify-between transition-all overflow-hidden select-none ${
                                aiPersonality === persona.id 
                                  ? 'border-purple-500 bg-purple-50/20 dark:bg-purple-950/10' 
                                  : 'border-gray-100 dark:border-slate-850 hover:border-gray-200 dark:hover:border-slate-800 bg-transparent'
                              }`}
                            >
                              <div className="text-left relative z-10 flex-1">
                                <h6 className="text-xs font-bold text-gray-855 dark:text-white leading-none">{persona.title}</h6>
                                <p className="text-[9px] text-gray-400 mt-1 font-medium">{persona.desc}</p>
                              </div>
                              {aiPersonality === persona.id && (
                                <FiCheck size={14} className="text-purple-500 z-10 shrink-0" />
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 8. TABS CONTENT: HELP & SUPPORT */}
                {activeTab === 'help' && (
                  <div className="space-y-6">
                    
                    {/* Header */}
                    <div className="bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-slate-855 p-6 rounded-[2.5rem] shadow-sm">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 bg-amber-100/80 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center shadow-sm">
                          <FiSliders size={22} className="stroke-[2.5]" />
                        </div>
                        <div>
                          <h2 className="text-lg font-black text-gray-900 dark:text-white leading-normal">
                            Help Center Support
                          </h2>
                          <p className="text-[11px] text-gray-400 mt-0.5">Clarify doubts through expandable FAQs list or submit support tickets</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* FAQs accordion */}
                      <div className="bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-slate-855 p-6 rounded-[2.5rem] shadow-sm space-y-4">
                        <h4 className="text-xs font-extrabold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                          Frequently Asked Questions
                        </h4>
                        
                        <div className="space-y-3 select-none">
                          {[
                            { q: 'Is Pigeon encryption standard secured?', a: 'Yes! All direct text chats and voice call signaling packets are fully cryptography protected using E2EE protocols.' },
                            { q: 'How do I initiate an audio or video call?', a: 'Tap any friend or group header bar inside messaging, click the phone/video toggle icon, and wait for signaling modals.' },
                            { q: 'What is Premium Member badge mode?', a: 'Premium accounts get special gold borders and animated sparkles on settings views and messaging tags to increase priority visual look.' }
                          ].map((item, index) => {
                            const isExpanded = faqExpanded[index];
                            return (
                              <div key={index} className="border border-gray-100 dark:border-slate-800/80 rounded-2xl overflow-hidden bg-gray-50/20 dark:bg-slate-900/20 shadow-sm transition-all">
                                <div 
                                  onClick={() => setFaqExpanded({ ...faqExpanded, [index]: !isExpanded })}
                                  className="p-3.5 flex justify-between items-center cursor-pointer font-bold text-xs text-gray-850 dark:text-slate-205"
                                >
                                  <span>{item.q}</span>
                                  <FiChevronDown size={14} className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                </div>
                                {isExpanded && (
                                  <div className="p-4 bg-white dark:bg-slate-900 text-xs text-gray-500 dark:text-slate-400 border-t border-gray-55 dark:border-slate-855/60 leading-relaxed font-medium">
                                    {item.a}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Ticket Form submission */}
                      <div className="bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-slate-855 p-6 rounded-[2.5rem] shadow-sm flex flex-col h-full justify-between">
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-xs font-extrabold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                              Submit Support Ticket
                            </h4>
                            <p className="text-[10px] text-gray-450 mt-0.5">Send crash logs or feature suggestions directly to team</p>
                          </div>

                          <form onSubmit={handleSendFeedback} className="space-y-3.5">
                            <div>
                              <label className="block text-[9.5px] font-bold text-gray-400 uppercase mb-1">Your Email</label>
                              <input 
                                type="email" 
                                required
                                value={feedbackEmail}
                                onChange={(e) => setFeedbackEmail(e.target.value)}
                                className="w-full text-xs px-3.5 py-3 rounded-xl border border-gray-150 dark:border-slate-800 bg-gray-50/40 dark:bg-slate-950/40 text-gray-855 dark:text-white focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[9.5px] font-bold text-gray-400 uppercase mb-1">Description</label>
                              <textarea 
                                rows={3.5}
                                required
                                placeholder="State description details..."
                                value={feedbackMsg}
                                onChange={(e) => setFeedbackMsg(e.target.value)}
                                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-150 dark:border-slate-800 bg-gray-50/40 dark:bg-slate-950/40 text-gray-850 dark:text-white focus:outline-none resize-none animate-fade-in"
                              />
                            </div>
                            <button 
                              type="submit"
                              className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-extrabold uppercase tracking-widest transition-colors shadow-sm shadow-primary-500/10 cursor-pointer"
                            >
                              Submit Support Ticket
                            </button>
                          </form>
                        </div>
                      </div>

                    </div>

                  </div>
                )}

              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Right Side: High-Fidelity Vertical Sub-Navigation Sidebar Panel (Desktop Only) */}
        <div className="hidden lg:flex flex-col w-76 shrink-0 bg-white dark:bg-[#090d16] border-l border-gray-150 dark:border-white/[0.04] p-5 overflow-y-auto custom-scrollbar space-y-2 select-none relative">
          
          {/* Ambient Background Lights */}
          <div className="absolute bottom-[-50px] right-[-5%] w-48 h-48 bg-gradient-to-tr from-primary-500/10 to-primary-600/10 dark:from-primary-500/5 dark:to-primary-600/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="mb-4">
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block pl-2">
              Settings Menu
            </span>
          </div>

          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id && !searchQuery;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSearchQuery('');
                }}
                className={`relative flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-300 cursor-pointer select-none text-left w-full group ${
                  isActive 
                    ? 'bg-[#182343]/60 border border-white/[0.05] text-white shadow-lg' 
                    : 'text-slate-450 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white border border-transparent hover:bg-slate-100/60 dark:hover:bg-white/[0.02]'
                }`}
              >
                {/* Sliding active pill indicator */}
                {isActive && (
                  <motion.span
                    layoutId="settings-active-pill"
                    className="absolute left-0 top-2.5 bottom-2.5 w-[3px] rounded-r-full bg-gradient-to-b from-primary-500 to-indigo-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  />
                )}

                {/* Icon Container */}
                <div
                  className={`shrink-0 w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-300
                    ${
                      isActive
                        ? 'bg-gradient-to-tr from-primary-600 to-primary-500 text-white shadow-md shadow-primary-500/10'
                        : 'bg-gray-100 dark:bg-white/5 border border-gray-150 dark:border-white/[0.03] text-slate-455 dark:text-slate-500 group-hover:bg-gray-200 dark:group-hover:bg-white/10 group-hover:text-gray-800 dark:group-hover:text-white'
                    }
                  `}
                >
                  <Icon size={16} className="stroke-[2.5]" />
                </div>

                {/* Tab Labels */}
                <div className="flex-1 min-w-0">
                  <p className="text-[12.5px] font-bold text-gray-850 dark:text-white truncate leading-tight">
                    {tab.label}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5 font-medium leading-tight">
                    {tab.desc}
                  </p>
                </div>

                {isActive && (
                  <FiChevronRight size={14} className="text-primary-500 dark:text-primary-400 shrink-0 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>

      </div>

    </div>

      {/* CONFIRM LOGOUT MODAL OVERLAY */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 shadow-2xl rounded-[2.5rem] p-6 max-w-[340px] w-full text-center space-y-5"
            >
              <div className="w-14 h-14 bg-red-100 dark:bg-red-950/40 text-red-500 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                <FiLogOut size={26} className="stroke-[2.5]" />
              </div>
              
              <div>
                <h3 className="font-extrabold text-[16px] text-gray-900 dark:text-white tracking-tight">Confirm Log Out</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                  Are you absolutely sure you want to end your active communication session on this device?
                </p>
              </div>

              <div className="flex gap-3 pt-1">
                <button 
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleLogoutConfirm}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-650 text-white rounded-xl text-xs font-extrabold uppercase tracking-wide transition-all shadow-md shadow-red-500/10 cursor-pointer"
                >
                  Log Out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Settings;
