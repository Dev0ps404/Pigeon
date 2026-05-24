import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from './redux/slices/uiSlice';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Groups from './pages/Groups';
import Calls from './pages/Calls';
import Friends from './pages/Friends';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import Admin from './pages/Admin';
import Landing from './pages/Landing';
import CallOverlay from './components/CallOverlay/CallOverlay';
import { Toaster } from 'react-hot-toast';
import { initiateSocketConnection, disconnectSocket, getSocket } from './socket/socketClient';
import api from './services/api';
import toast from 'react-hot-toast';

function App() {
  const dispatch = useDispatch();
  const { theme } = useSelector((state) => state.ui);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const [call, setCall] = useState({
    isActive: false,
    direction: null,
    otherUser: null,
    callType: 'audio',
    signal: null,
    status: 'idle',
  });

  // Handle theme, accent color, and font size scaling globally from Redux user state
  useEffect(() => {
    // 1. Theme Configuration
    const currentTheme = user?.selectedTheme || theme || 'light';
    if (currentTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('theme-cyberpunk');
    } else if (currentTheme === 'cyberpunk') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.add('theme-cyberpunk');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.remove('theme-cyberpunk');
    }

    // 2. Accent Color Highlights
    const currentAccent = user?.accentColor || 'indigo';
    const accentClasses = ['accent-indigo', 'accent-emerald', 'accent-rose', 'accent-amber'];
    accentClasses.forEach(c => document.documentElement.classList.remove(c));
    document.documentElement.classList.add(`accent-${currentAccent}`);

    // 3. Typography Text Scaling
    const currentFontSize = user?.fontSize || 14;
    document.documentElement.style.fontSize = `${currentFontSize}px`;
  }, [user?.selectedTheme, user?.accentColor, user?.fontSize, theme]);

  // Handle global persistent socket connection
  useEffect(() => {
    if (isAuthenticated && user) {
      const socket = initiateSocketConnection();
      socket.emit('setup', user);

      // Listen for incoming calls
      socket.on('incoming-call', ({ signal, from, callerName }) => {
        setCall({
          isActive: true,
          direction: 'incoming',
          otherUser: { 
            _id: from, 
            username: callerName, 
            profilePicture: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg" 
          },
          callType: signal?.type || 'audio',
          signal,
          status: 'ringing',
        });
        toast(`Incoming ${signal?.type || 'audio'} call...`, { icon: '📞' });
      });

      socket.on('call-accepted', (signal) => {
        setCall((prev) => ({ ...prev, status: 'connected', signal }));
        toast.success('Call connected!');
      });

      socket.on('call-declined', () => {
        setCall((prev) => {
          if (prev.direction === 'outgoing' && prev.otherUser) {
            api.post('/calls', {
              receiverId: prev.otherUser._id,
              type: prev.callType,
              status: 'missed',
              duration: 0,
            }).catch(console.error);
          }
          return {
            isActive: false,
            direction: null,
            otherUser: null,
            callType: 'audio',
            signal: null,
            status: 'idle',
          };
        });
        toast.error('Call declined');
      });

      socket.on('call-ended', () => {
        setCall((prev) => {
          if (prev.otherUser) {
            api.post('/calls', {
              receiverId: prev.otherUser._id,
              type: prev.callType,
              status: 'completed',
              duration: 12,
            }).catch(console.error);
          }
          return {
            isActive: false,
            direction: null,
            otherUser: null,
            callType: 'audio',
            signal: null,
            status: 'idle',
          };
        });
        toast.success('Call ended');
      });

      return () => {
        socket.off('incoming-call');
        socket.off('call-accepted');
        socket.off('call-declined');
        socket.off('call-ended');
        disconnectSocket();
      };
    }
  }, [isAuthenticated, user]);

  // Handle outgoing call events from window triggers
  useEffect(() => {
    const handleInitCall = (e) => {
      const { otherUser, type } = e.detail;
      const socket = getSocket();
      if (!socket) return toast.error('Socket not connected');

      setCall({
        isActive: true,
        direction: 'outgoing',
        otherUser,
        callType: type,
        signal: { type },
        status: 'calling',
      });

      socket.emit('call-user', {
        userToCall: otherUser._id,
        signalData: { type },
        from: user?._id,
        callerName: user?.username,
      });
      toast(`Calling ${otherUser.username}...`);
    };

    window.addEventListener('initiate-call', handleInitCall);
    return () => window.removeEventListener('initiate-call', handleInitCall);
  }, [user]);

  const handleAnswer = () => {
    const socket = getSocket();
    if (!socket || !call.otherUser) return;

    socket.emit('answer-call', {
      to: call.otherUser._id,
      signal: { type: call.callType },
    });

    setCall((prev) => ({ ...prev, status: 'connected' }));
  };

  const handleDecline = () => {
    const socket = getSocket();
    if (!socket || !call.otherUser) return;

    socket.emit('decline-call', { to: call.otherUser._id });

    api.post('/calls', {
      receiverId: call.otherUser._id,
      type: call.callType,
      status: 'missed',
      duration: 0,
    }).catch(console.error);

    setCall({
      isActive: false,
      direction: null,
      otherUser: null,
      callType: 'audio',
      signal: null,
      status: 'idle',
    });
  };

  const handleEnd = () => {
    const socket = getSocket();
    if (!socket || !call.otherUser) return;

    socket.emit('end-call', { to: call.otherUser._id });

    api.post('/calls', {
      receiverId: call.otherUser._id,
      type: call.callType,
      status: 'completed',
      duration: 20,
    }).catch(console.error);

    setCall({
      isActive: false,
      direction: null,
      otherUser: null,
      callType: 'audio',
      signal: null,
      status: 'idle',
    });
  };

  return (
    <Router>
      <div className="min-h-screen font-sans bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <Toaster position="top-center" />
        <CallOverlay 
          call={call} 
          onAnswer={handleAnswer} 
          onDecline={handleDecline} 
          onEnd={handleEnd} 
        />
        
        <Routes>
          {/* Public Landing Page */}
          {!isAuthenticated && <Route path="/" element={<Landing />} />}

          <Route element={<AuthLayout />}>
            <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
            <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
            <Route path="/forgot-password" element={!isAuthenticated ? <ForgotPassword /> : <Navigate to="/" />} />
          </Route>
          
          <Route element={<MainLayout />}>
            {/* If authenticated, "/" renders Home. Otherwise it falls back to redirect or matches above */}
            {isAuthenticated && <Route path="/" element={<Home />} />}
            <Route path="/groups" element={isAuthenticated ? <Groups /> : <Navigate to="/login" />} />
            <Route path="/calls" element={isAuthenticated ? <Calls /> : <Navigate to="/login" />} />
            <Route path="/friends" element={isAuthenticated ? <Friends /> : <Navigate to="/login" />} />
            <Route path="/notifications" element={isAuthenticated ? <Notifications /> : <Navigate to="/login" />} />
            <Route path="/settings" element={isAuthenticated ? <Settings /> : <Navigate to="/login" />} />
            <Route path="/admin" element={isAuthenticated ? <Admin /> : <Navigate to="/login" />} />
          </Route>

          {/* Catch-all redirect to home/landing */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
