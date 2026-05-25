import { useEffect, useState, useRef } from 'react';
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

// Native Web Audio API synthesizer for network-independent incoming & outgoing call tones
const SoundPlayer = {
  audioCtx: null,
  oscillator1: null,
  oscillator2: null,
  gainNode: null,
  ringInterval: null,

  init() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
  },

  playOutgoing() {
    this.stop();
    this.init();
    
    const playBeep = () => {
      if (!this.audioCtx) return;
      try {
        const osc1 = this.audioCtx.createOscillator();
        const osc2 = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc1.frequency.value = 440;
        osc2.frequency.value = 480;
        gain.gain.setValueAtTime(0, this.audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.1, this.audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, this.audioCtx.currentTime + 1.5);
        gain.gain.linearRampToValueAtTime(0, this.audioCtx.currentTime + 1.6);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc1.start();
        osc2.start();
        
        osc1.stop(this.audioCtx.currentTime + 1.8);
        osc2.stop(this.audioCtx.currentTime + 1.8);
        
        this.oscillator1 = osc1;
        this.oscillator2 = osc2;
        this.gainNode = gain;
      } catch (err) {
        console.error('SoundPlayer outgoing error', err);
      }
    };

    playBeep();
    this.ringInterval = setInterval(playBeep, 4000);
  },

  playIncoming() {
    this.stop();
    this.init();

    const notes = [261.63, 329.63, 392.00, 523.25]; // C-Major Chord arpeggio sequence
    let index = 0;

    const playSequence = () => {
      if (!this.audioCtx) return;
      try {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(notes[index % notes.length], this.audioCtx.currentTime);
        
        gain.gain.setValueAtTime(0, this.audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.15, this.audioCtx.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.4);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.45);
        index++;
      } catch (err) {
        console.error('SoundPlayer incoming error', err);
      }
    };

    this.ringInterval = setInterval(playSequence, 150);
  },

  stop() {
    if (this.ringInterval) {
      clearInterval(this.ringInterval);
      this.ringInterval = null;
    }
    if (this.oscillator1) {
      try { this.oscillator1.stop(); } catch(e){}
      this.oscillator1 = null;
    }
    if (this.oscillator2) {
      try { this.oscillator2.stop(); } catch(e){}
      this.oscillator2 = null;
    }
    if (this.gainNode) {
      try { this.gainNode.disconnect(); } catch(e){}
      this.gainNode = null;
    }
  }
};

const peerConfiguration = {
  iceServers: [
    {
      urls: [
        'stun:stun.l.google.com:19302',
        'stun:stun1.l.google.com:19302',
        'stun:stun2.l.google.com:19302',
        'stun:stun3.l.google.com:19302',
        'stun:stun4.l.google.com:19302',
      ],
    },
  ],
};

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
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const iceCandidatesQueueRef = useRef([]);
  const remoteDescriptionSetRef = useRef(false);

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

  const cleanupCall = () => {
    SoundPlayer.stop();

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.error('Error stopping stream track:', e);
        }
      });
      localStreamRef.current = null;
    }
    setLocalStream(null);
    setRemoteStream(null);

    if (pcRef.current) {
      try {
        pcRef.current.close();
      } catch (e) {
        console.error('Error closing peer connection:', e);
      }
      pcRef.current = null;
    }

    iceCandidatesQueueRef.current = [];
    remoteDescriptionSetRef.current = false;

    setCall({
      isActive: false,
      direction: null,
      otherUser: null,
      callType: 'audio',
      signal: null,
      status: 'idle',
    });
  };

  const setupPeerConnection = (stream, otherUserId) => {
    const pc = new RTCPeerConnection(peerConfiguration);
    pcRef.current = pc;

    // Attach local tracks
    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });

    // Handle remote track arriving
    pc.ontrack = (event) => {
      console.log('Received remote track', event.streams[0]);
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
      } else {
        setRemoteStream(new MediaStream([event.track]));
      }
    };

    // Relay local ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        const socket = getSocket();
        if (socket) {
          socket.emit('ice-candidate', {
            to: otherUserId,
            candidate: event.candidate,
            from: user?._id,
          });
        }
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', pc.iceConnectionState);
      if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
        toast.error('Connection interrupted. Reconnecting...');
      }
    };

    return pc;
  };

  // Handle global persistent socket connection
  useEffect(() => {
    if (isAuthenticated && user) {
      const socket = initiateSocketConnection();
      socket.emit('setup', user);

      // Listen for incoming calls
      socket.on('incoming-call', ({ signal, from, callerName }) => {
        SoundPlayer.playIncoming();
        setCall({
          isActive: true,
          direction: 'incoming',
          otherUser: { 
            _id: from, 
            username: callerName, 
            profilePicture: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg" 
          },
          callType: signal?.type === 'video' ? 'video' : 'audio',
          signal,
          status: 'ringing',
        });
        toast(`Incoming ${signal?.type === 'video' ? 'video' : 'audio'} call...`, { icon: '📞' });
      });

      socket.on('call-accepted', async (signal) => {
        SoundPlayer.stop();
        if (pcRef.current) {
          try {
            await pcRef.current.setRemoteDescription(new RTCSessionDescription(signal));
            setCall((prev) => ({ ...prev, status: 'connected' }));
            
            // Flush candidates
            remoteDescriptionSetRef.current = true;
            while (iceCandidatesQueueRef.current.length > 0) {
              const candidate = iceCandidatesQueueRef.current.shift();
              try {
                await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
              } catch (err) {
                console.error('Error flushing candidate:', err);
              }
            }
            toast.success('Call connected!');
          } catch (e) {
            console.error('Failed to set remote description on call-accepted:', e);
            toast.error('Failed to establish media connection.');
          }
        }
      });

      socket.on('ice-candidate', async ({ candidate }) => {
        if (pcRef.current) {
          try {
            if (remoteDescriptionSetRef.current) {
              await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
            } else {
              iceCandidatesQueueRef.current.push(candidate);
            }
          } catch (e) {
            console.error('Error adding ICE candidate:', e);
          }
        }
      });

      socket.on('call-declined', () => {
        toast.error('Call declined');
        cleanupCall();
      });

      socket.on('call-ended', () => {
        toast.success('Call ended');
        cleanupCall();
      });

      return () => {
        socket.off('incoming-call');
        socket.off('call-accepted');
        socket.off('ice-candidate');
        socket.off('call-declined');
        socket.off('call-ended');
        disconnectSocket();
      };
    }
  }, [isAuthenticated, user]);

  // Handle outgoing call events from window triggers
  useEffect(() => {
    const handleInitCall = async (e) => {
      const { otherUser, type } = e.detail;
      const socket = getSocket();
      if (!socket) return toast.error('Socket not connected');

      SoundPlayer.playOutgoing();

      setCall({
        isActive: true,
        direction: 'outgoing',
        otherUser,
        callType: type,
        signal: null,
        status: 'calling',
      });

      try {
        let stream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: type === 'video',
            audio: true,
          });
        } catch (err) {
          console.warn('getUserMedia failed, falling back to audio only', err);
          if (type === 'video') {
            toast.error("Camera access failed. Trying audio-only...");
            stream = await navigator.mediaDevices.getUserMedia({
              video: false,
              audio: true,
            });
            setCall((prev) => ({ ...prev, callType: 'audio' }));
          } else {
            throw err;
          }
        }

        localStreamRef.current = stream;
        setLocalStream(stream);

        const pc = setupPeerConnection(stream, otherUser._id);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socket.emit('call-user', {
          userToCall: otherUser._id,
          signalData: offer,
          from: user?._id,
          callerName: user?.username,
        });

        toast(`Calling ${otherUser.username}...`);
      } catch (err) {
        console.error('Failed to initiate call:', err);
        toast.error('Could not access microphone/camera.');
        cleanupCall();
      }
    };

    window.addEventListener('initiate-call', handleInitCall);
    return () => window.removeEventListener('initiate-call', handleInitCall);
  }, [user]);

  const handleAnswer = async () => {
    const socket = getSocket();
    if (!socket || !call.otherUser || !call.signal) return;

    SoundPlayer.stop();

    try {
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: call.callType === 'video',
          audio: true,
        });
      } catch (err) {
        console.warn('getUserMedia failed, falling back to audio only', err);
        if (call.callType === 'video') {
          toast.error("Camera access failed. Trying audio-only...");
          stream = await navigator.mediaDevices.getUserMedia({
            video: false,
            audio: true,
          });
          setCall((prev) => ({ ...prev, callType: 'audio' }));
        } else {
          throw err;
        }
      }

      localStreamRef.current = stream;
      setLocalStream(stream);

      const pc = setupPeerConnection(stream, call.otherUser._id);

      await pc.setRemoteDescription(new RTCSessionDescription(call.signal));

      remoteDescriptionSetRef.current = true;
      while (iceCandidatesQueueRef.current.length > 0) {
        const candidate = iceCandidatesQueueRef.current.shift();
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error('Error flushing candidate:', err);
        }
      }

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit('answer-call', {
        to: call.otherUser._id,
        signal: answer,
      });

      setCall((prev) => ({ ...prev, status: 'connected' }));
      toast.success('Call connected!');
    } catch (err) {
      console.error('Failed to answer call:', err);
      toast.error('Error answering call.');
      handleDecline();
    }
  };

  const handleDecline = () => {
    const socket = getSocket();
    if (socket && call.otherUser) {
      socket.emit('decline-call', { to: call.otherUser._id });
    }

    if (call.otherUser) {
      api.post('/calls', {
        receiverId: call.otherUser._id,
        type: call.callType,
        status: 'missed',
        duration: 0,
      }).catch(console.error);
    }

    cleanupCall();
  };

  const handleEnd = () => {
    const socket = getSocket();
    if (socket && call.otherUser) {
      socket.emit('end-call', { to: call.otherUser._id });
    }

    if (call.otherUser) {
      api.post('/calls', {
        receiverId: call.otherUser._id,
        type: call.callType,
        status: 'completed',
        duration: 15,
      }).catch(console.error);
    }

    cleanupCall();
  };

  return (
    <Router>
      <div className="min-h-screen font-sans bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <Toaster position="top-center" />
        <CallOverlay 
          call={call} 
          localStream={localStream}
          remoteStream={remoteStream}
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
