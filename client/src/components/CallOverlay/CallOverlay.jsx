import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  FiPhone, 
  FiPhoneOff, 
  FiVideo, 
  FiVideoOff, 
  FiMic, 
  FiMicOff 
} from 'react-icons/fi';

const CallOverlay = ({ call, localStream, remoteStream, onAnswer, onDecline, onEnd }) => {
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [timer, setTimer] = useState(0);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);

  // Active call duration timer
  useEffect(() => {
    let interval;
    if (call.status === 'connected') {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else {
      setTimer(0);
    }
    return () => clearInterval(interval);
  }, [call.status]);

  // Attach local stream to video tag
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Attach remote stream to video tag
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Attach remote stream to audio tag (for audio call fallback)
  useEffect(() => {
    if (remoteAudioRef.current && remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Toggle tracks dynamically
  useEffect(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !muted;
      });
    }
  }, [muted, localStream]);

  useEffect(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !cameraOff;
      });
    }
  }, [cameraOff, localStream]);

  const formatTimer = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!call.isActive) return null;

  const isVideoConnected = call.callType === 'video' && call.status === 'connected';

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-xl z-50 flex items-center justify-center p-4">
      {/* Hidden audio tags for robust audio play */}
      {call.callType === 'audio' && remoteStream && (
        <audio ref={remoteAudioRef} autoPlay playsInline style={{ display: 'none' }} />
      )}

      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 120 }}
        className="w-full max-w-lg h-[80vh] md:h-[650px] bg-[#090d16]/90 border border-white/10 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden text-white flex flex-col justify-between p-8"
      >
        {/* Dynamic Video background if calling/video */}
        {isVideoConnected && (
          <div className="absolute inset-0 z-0 bg-black">
            <video 
              ref={remoteVideoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
            />
            {/* Vignette Overlay for premium look */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70 pointer-events-none"></div>

            {/* Local Pip webcam preview */}
            {!cameraOff && localStream && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute bottom-28 right-6 w-32 h-44 bg-gray-900 border border-white/20 rounded-2xl overflow-hidden z-20 shadow-2xl"
              >
                <video 
                  ref={localVideoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              </motion.div>
            )}
          </div>
        )}

        {/* Top bar info */}
        <div className="relative z-10 w-full flex flex-col items-center mt-4">
          <span className="text-[10px] tracking-[0.25em] uppercase font-bold text-blue-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
            {call.status === 'calling' && 'PIGEON CALLING...'}
            {call.status === 'ringing' && 'PIGEON RINGING...'}
            {call.status === 'connected' && 'SECURED LINE CONNECTED'}
          </span>
          {call.status === 'connected' && (
            <span className="font-mono text-lg font-bold text-emerald-400 mt-2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-emerald-500/20">
              {formatTimer(timer)}
            </span>
          )}
        </div>

        {/* Center content (Avatars/Names for Calling/Ringing or Audio Call) */}
        {(!isVideoConnected || call.status !== 'connected') && (
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center my-auto">
            {/* Profile Avatar with pulsating halo effect */}
            <div className="relative mb-6">
              {call.status !== 'connected' && (
                <>
                  <div className="absolute inset-[-10px] rounded-full border border-blue-500/20 animate-ping opacity-60"></div>
                  <div className="absolute inset-[-20px] rounded-full border border-indigo-500/10 animate-pulse opacity-40"></div>
                </>
              )}
              <img 
                referrerPolicy="no-referrer" 
                src={call.otherUser?.profilePicture || "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"} 
                alt="avatar" 
                className="w-28 h-28 rounded-full border-[3px] border-white/20 object-cover shadow-[0_10px_30px_rgba(0,0,0,0.5)] relative z-10"
              />
            </div>

            <h3 className="text-2xl font-bold tracking-tight mb-2 drop-shadow-md">
              {call.otherUser?.username}
            </h3>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest bg-white/5 border border-white/10 px-3 py-1 rounded-full backdrop-blur-md">
              {call.callType} Call
            </span>
          </div>
        )}

        {/* Bottom panel for interactive controls */}
        <div className="relative z-10 w-full mt-auto flex flex-col items-center">
          {call.direction === 'incoming' && call.status === 'ringing' ? (
            // Accept / Decline options
            <div className="flex gap-8 mb-4">
              <button 
                onClick={onDecline}
                className="w-16 h-16 bg-gradient-to-br from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all text-white border border-red-500/20"
                title="Decline"
              >
                <FiPhoneOff size={24} />
              </button>
              
              <button 
                onClick={onAnswer}
                className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-green-600 hover:from-emerald-500 hover:to-green-700 rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all text-white border border-green-500/20 animate-bounce"
                title="Answer"
              >
                <FiPhone size={24} />
              </button>
            </div>
          ) : (
            // Outgoing / Active controls
            <div className="flex items-center gap-5 bg-[#121826]/40 border border-white/10 backdrop-blur-xl px-6 py-4 rounded-full shadow-[0_10px_35px_rgba(0,0,0,0.3)] mb-4">
              <button 
                onClick={() => setMuted(!muted)}
                className={`w-12 h-12 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all ${
                  muted 
                    ? 'bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-lg shadow-red-500/20 border border-red-500/20' 
                    : 'bg-white/5 text-gray-300 hover:text-white hover:bg-white/10'
                }`}
                title={muted ? 'Unmute' : 'Mute'}
              >
                {muted ? <FiMicOff size={20} /> : <FiMic size={20} />}
              </button>

              {call.callType === 'video' && (
                <button 
                  onClick={() => setCameraOff(!cameraOff)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all ${
                    cameraOff 
                      ? 'bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-lg shadow-red-500/20 border border-red-500/20' 
                      : 'bg-white/5 text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                  title={cameraOff ? 'Turn Camera On' : 'Turn Camera Off'}
                >
                  {cameraOff ? <FiVideoOff size={20} /> : <FiVideo size={20} />}
                </button>
              )}

              <button 
                onClick={onEnd}
                className="w-14 h-14 bg-gradient-to-br from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all text-white border border-red-500/20"
                title="End Call"
              >
                <FiPhoneOff size={22} />
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default CallOverlay;
