import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPhone, 
  FiPhoneOff, 
  FiVideo, 
  FiVideoOff, 
  FiMic, 
  FiMicOff, 
  FiVolume2 
} from 'react-icons/fi';

const CallOverlay = ({ call, onAnswer, onDecline, onEnd }) => {
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [timer, setTimer] = useState(0);

  // Active call duration timer
  useEffect(() => {
    let interval;
    if (call.status === 'connected') {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [call.status]);

  const formatTimer = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!call.isActive) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-lg bg-[#0d1117]/80 border border-white/10 rounded-[2.5rem] shadow-2xl p-8 relative overflow-hidden text-white flex flex-col items-center"
      >
        {/* Dynamic Video background if calling/video */}
        {call.callType === 'video' && call.status === 'connected' && !cameraOff && (
          <div className="absolute inset-0 z-0">
            <div className="w-full h-full bg-gradient-to-tr from-blue-900/30 to-indigo-900/30 animate-pulse relative">
              <img referrerPolicy="no-referrer" 
                src={call.otherUser?.profilePicture} 
                alt="Feed" 
                className="w-full h-full object-cover opacity-60 blur-sm"
              />
              <div className="absolute inset-0 bg-black/40"></div>
            </div>
            {/* Local Pip webcam preview */}
            <div className="absolute bottom-6 right-6 w-28 h-36 bg-gray-900 border border-white/20 rounded-2xl overflow-hidden z-10 shadow-lg">
              <div className="w-full h-full bg-gradient-to-br from-indigo-700 to-purple-800 animate-pulse flex items-center justify-center">
                <span className="text-[10px] font-bold text-white/70">My Feed</span>
              </div>
            </div>
          </div>
        )}

        <div className="relative z-10 flex-1 flex flex-col items-center w-full">
          {/* Header State Info */}
          <span className="text-xs uppercase tracking-widest text-blue-400 font-bold mb-8">
            {call.status === 'calling' && 'Initiating pigeon line...'}
            {call.status === 'ringing' && 'Ringing...'}
            {call.status === 'connected' && 'Crystal Clear Stream Active'}
          </span>

          {/* Peer Avatar & wave anim */}
          <div className="relative mb-6">
            {call.status !== 'connected' && (
              <div className="absolute inset-0 w-32 h-32 rounded-full border border-blue-500/30 animate-ping opacity-75"></div>
            )}
            <img referrerPolicy="no-referrer" 
              src={call.otherUser?.profilePicture || "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"} 
              alt="avatar" 
              className="w-32 h-32 rounded-full border-4 border-white/10 object-cover shadow-2xl relative z-10"
            />
          </div>

          <h3 className="text-2xl font-bold mb-1">{call.otherUser?.username}</h3>
          
          {call.status === 'connected' ? (
            <span className="font-mono text-sm text-green-400 font-semibold mb-12">
              {formatTimer(timer)}
            </span>
          ) : (
            <span className="text-sm text-gray-400 mb-12 capitalize">
              Pigeon {call.callType} Call
            </span>
          )}

          {/* Interactive controls */}
          <div className="w-full flex flex-col items-center gap-6 mt-auto">
            
            {/* Incoming call actions */}
            {call.direction === 'incoming' && call.status === 'ringing' ? (
              <div className="flex gap-8">
                <button 
                  onClick={onDecline}
                  className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all text-white"
                  title="Decline"
                >
                  <FiPhoneOff size={24} />
                </button>
                
                <button 
                  onClick={onAnswer}
                  className="w-16 h-16 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all text-white animate-bounce"
                  title="Answer"
                >
                  <FiPhone size={24} />
                </button>
              </div>
            ) : (
              /* Outgoing or connected actions */
              <div className="flex items-center gap-5 bg-white/5 border border-white/10 backdrop-blur-xl px-6 py-4 rounded-full shadow-lg">
                <button 
                  onClick={() => setMuted(!muted)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all ${muted ? 'bg-red-500 text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                  title={muted ? 'Unmute' : 'Mute'}
                >
                  {muted ? <FiMicOff size={20} /> : <FiMic size={20} />}
                </button>

                {call.callType === 'video' && (
                  <button 
                    onClick={() => setCameraOff(!cameraOff)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all ${cameraOff ? 'bg-red-500 text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                    title={cameraOff ? 'Turn Camera On' : 'Turn Camera Off'}
                  >
                    {cameraOff ? <FiVideoOff size={20} /> : <FiVideo size={20} />}
                  </button>
                )}

                <button 
                  onClick={onEnd}
                  className="w-14 h-14 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all text-white"
                  title="End Call"
                >
                  <FiPhoneOff size={22} />
                </button>
              </div>
            )}

          </div>

        </div>
      </motion.div>
    </div>
  );
};

export default CallOverlay;
