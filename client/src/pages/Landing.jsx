import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiZap, 
  FiShield, 
  FiSmartphone, 
  FiArrowRight, 
  FiTwitter, 
  FiGithub, 
  FiSearch, 
  FiPhone, 
  FiVideo, 
  FiSidebar, 
  FiFolder,
  FiServer,
  FiCpu
} from 'react-icons/fi';
import PigeonLogo from '../components/Logo';

const Landing = () => {
  const navigate = useNavigate();

  // Common animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-[#0B1020] text-slate-100 font-sans antialiased selection:bg-blue-600/30 selection:text-white relative overflow-x-hidden">
      
      {/* Decorative Drifting Background Gradient Blobs (Ambient Lights) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Orb 1 */}
        <motion.div
          animate={{
            x: [0, 60, -30, 0],
            y: [0, -80, 50, 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-0 -left-[10%] w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] rounded-full bg-blue-600/10 blur-[100px] md:blur-[150px]"
        />

        {/* Orb 2 */}
        <motion.div
          animate={{
            x: [0, -70, 40, 0],
            y: [0, 50, -90, 0],
            scale: [1, 0.95, 1.15, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -bottom-[10%] -right-[10%] w-[70vw] h-[70vw] max-w-[700px] max-h-[700px] rounded-full bg-purple-600/10 blur-[120px] md:blur-[160px]"
        />

        {/* Orb 3 */}
        <motion.div
          animate={{
            x: [0, 40, -40, 0],
            y: [0, 60, 40, 0],
            scale: [1, 1.1, 0.9, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-[30%] left-[25%] w-[45vw] h-[45vw] max-w-[500px] max-h-[500px] rounded-full bg-cyan-500/8 blur-[90px] md:blur-[110px]"
        />
      </div>

      {/* Decorative Matrix Grid overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Navigation Header */}
      <header className="w-full h-20 px-6 md:px-12 flex items-center justify-between border-b border-white/5 bg-[#0B1020]/75 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <PigeonLogo className="w-10 h-10 shadow-lg shadow-blue-500/10 rounded-xl" variant="gradient" />
          <span className="font-black text-2xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-350 bg-clip-text text-transparent">
            Pigeon
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link 
            to="/login" 
            className="text-slate-400 hover:text-white font-bold transition-colors py-2 px-4 text-[14px]"
          >
            Sign In
          </Link>
          <Link 
            to="/register" 
            className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:via-indigo-500 hover:to-cyan-400 text-white font-extrabold py-2.5 px-6 rounded-xl shadow-lg shadow-blue-500/10 hover:shadow-blue-500/25 active:scale-95 transition-all duration-250 text-[14px] uppercase tracking-wider"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 pt-20 pb-16 flex flex-col items-center text-center relative z-10">
        
        {/* Top Announcement Pill */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 py-1.5 px-4 rounded-full text-blue-300 text-xs font-extrabold mb-6 backdrop-blur-md uppercase tracking-wider"
        >
          <span>🕊️</span> Web App v2.4 with Custom Video & Voice is Live
        </motion.div>

        {/* Big Bold Headline */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-7xl font-black tracking-tight leading-[1.1] max-w-5xl mb-6 bg-gradient-to-b from-white via-slate-100 to-slate-450 bg-clip-text text-transparent"
        >
          The world's most powerful<br />
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent italic font-medium">real-time messenger</span> in your browser.
        </motion.h1>

        {/* Hero Subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base md:text-lg text-slate-400 max-w-3xl mb-10 leading-relaxed font-medium"
        >
          No downloads required. Secure, zero-latency communication for modern tech teams and individuals. Experience ultimate privacy, audio/video channels, and rich sharing controls.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 mb-6 w-full sm:w-auto"
        >
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/register')}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:via-indigo-500 hover:to-cyan-400 text-white font-extrabold py-4 px-10 rounded-2xl shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 text-sm uppercase tracking-widest font-black"
          >
            Open Pigeon Web <FiArrowRight size={18} />
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/login')}
            className="w-full sm:w-auto bg-white/[0.03] hover:bg-white/[0.06] text-white border border-white/10 font-bold py-4 px-10 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm text-sm"
          >
            View Enterprise Demo
          </motion.button>
        </motion.div>

        {/* Trust Checkboxes */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex items-center gap-6 text-slate-500 text-[13px] font-bold mb-16"
        >
          <div className="flex items-center gap-1.5">
            <span className="text-blue-500 text-lg">✓</span> Zero installation
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-blue-500 text-lg">✓</span> E2E Router Encrypted
          </div>
        </motion.div>

        {/* Browser Mockup Visual Showcase */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 50, delay: 0.4 }}
          className="w-full max-w-5xl rounded-[2rem] border border-white/5 bg-[#0e1424]/60 p-3.5 shadow-[0_50px_100px_rgba(0,0,0,0.6)] relative group"
        >
          {/* Subtle neon glow under mockup on hover */}
          <div className="absolute inset-0 bg-blue-500/5 blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-[2rem]" />
          
          {/* Top Address Bar Row */}
          <div className="flex items-center gap-2 px-3 pb-3 border-b border-white/5 mb-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
            </div>
            <div className="flex-1 max-w-sm mx-auto bg-white/[0.02] border border-white/5 rounded-lg py-1 px-3 text-xs text-slate-500 flex items-center gap-1.5 justify-center">
              <span>🔒</span> pigeon.chat/workspace
            </div>
          </div>

          {/* Inner Web App Representation */}
          <div className="rounded-[1.25rem] overflow-hidden aspect-[16/9] bg-[#0c101d] flex border border-white/5 shadow-inner text-left relative z-10">
            
            {/* Mock Sidebar */}
            <div className="w-64 border-r border-white/5 bg-white/[0.01] p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-6 pl-1.5">
                  <PigeonLogo className="w-8 h-8 rounded-lg" variant="gradient" />
                  <span className="font-extrabold text-base text-white tracking-wide">Pigeon HQ</span>
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-3 px-3.5 py-3 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border border-blue-500/10 rounded-xl text-blue-300 font-extrabold text-[13px] tracking-wide relative">
                    <div className="absolute left-0 top-1/4 bottom-1/4 w-[3px] bg-blue-500 rounded-r" />
                    <span>💬</span> Messages
                    <span className="ml-auto bg-blue-600 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black">3</span>
                  </div>
                  <div className="flex items-center gap-3 px-3.5 py-3 hover:bg-white/[0.02] rounded-xl text-slate-400 text-[13px] font-bold transition-all">
                    <span>👥</span> Channels
                  </div>
                  <div className="flex items-center gap-3 px-3.5 py-3 hover:bg-white/[0.02] rounded-xl text-slate-400 text-[13px] font-bold transition-all">
                    <span>📞</span> Calls
                  </div>
                  <div className="flex items-center gap-3 px-3.5 py-3 hover:bg-white/[0.02] rounded-xl text-slate-400 text-[13px] font-bold transition-all">
                    <span>📁</span> Shared Files
                  </div>
                </div>
              </div>

              {/* Sidebar Profile Card */}
              <div className="flex items-center gap-3 p-2 bg-white/[0.02] rounded-xl border border-white/5">
                <div className="relative">
                  <img referrerPolicy="no-referrer" 
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face" 
                    alt="Susan" 
                    className="w-9 h-9 rounded-full object-cover border border-white/10" 
                  />
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#0B1020] rounded-full" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[12px] font-bold text-slate-200 leading-tight">Susan Miller</span>
                  <span className="text-[10px] text-green-400 font-bold">Active Now</span>
                </div>
              </div>
            </div>

            {/* Mock Chat Area */}
            <div className="flex-1 flex flex-col bg-white/[0.01]">
              {/* Header */}
              <div className="h-16 border-b border-white/5 px-6 flex items-center justify-between bg-white/[0.005]">
                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-sm text-slate-200"># general-chat 🕊️</span>
                </div>
                <div className="flex items-center gap-4 text-slate-400">
                  <FiSearch className="cursor-pointer hover:text-white transition-colors" />
                  <FiPhone className="cursor-pointer hover:text-white transition-colors" />
                  <FiVideo className="cursor-pointer hover:text-white transition-colors" />
                  <FiSidebar className="cursor-pointer hover:text-white transition-colors" />
                </div>
              </div>

              {/* Chat Message Thread */}
              <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto bg-black/10">
                
                {/* Message 1 */}
                <div className="flex items-start gap-3">
                  <img referrerPolicy="no-referrer" 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" 
                    alt="Mark" 
                    className="w-8 h-8 rounded-full object-cover border border-white/5" 
                  />
                  <div className="flex flex-col gap-1 max-w-[70%]">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-extrabold text-slate-200">Mark R.</span>
                      <span className="text-[9px] text-slate-500 font-bold">11:02 AM</span>
                    </div>
                    <div className="p-3.5 bg-white/[0.03] border border-white/5 rounded-2xl rounded-tl-sm text-[13px] text-slate-350 leading-relaxed">
                      Hey everyone! Just letting you know I'm updating the release branch with voice messaging now. Ping me if anything is urgent! 🚀
                    </div>
                  </div>
                </div>

                {/* Message 2 (Outgoing) */}
                <div className="flex items-start gap-3 justify-end">
                  <div className="flex flex-col gap-1 max-w-[70%] items-end">
                    <div className="flex items-center gap-2 justify-end">
                      <span className="text-[9px] text-slate-500 font-bold">11:03 AM</span>
                      <span className="text-[12px] font-extrabold text-blue-400">Me</span>
                    </div>
                    <div className="p-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl rounded-tr-sm text-[13px] leading-relaxed shadow-lg shadow-blue-500/5">
                      Perfect! Our socket pipeline is incredibly responsive. The Pigeon engine is really flying now. 🕊️
                    </div>
                  </div>
                  <img referrerPolicy="no-referrer" 
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face" 
                    alt="Me" 
                    className="w-8 h-8 rounded-full object-cover border border-white/5" 
                  />
                </div>

                {/* Message 3 */}
                <div className="flex items-start gap-3">
                  <img referrerPolicy="no-referrer" 
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face" 
                    alt="Dev" 
                    className="w-8 h-8 rounded-full object-cover border border-white/5" 
                  />
                  <div className="flex flex-col gap-1 max-w-[70%]">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-extrabold text-slate-200">Dev Sen</span>
                      <span className="text-[9px] text-slate-500 font-bold">11:05 AM</span>
                    </div>
                    <div className="p-3.5 bg-white/[0.03] border border-white/5 rounded-2xl rounded-tl-sm text-[13px] text-slate-350 leading-relaxed">
                      Sure! Here is the latest performance report, looking rock solid.
                      <div className="mt-2.5 p-2 bg-white/[0.02] border border-white/5 rounded-xl flex items-center gap-2 cursor-pointer hover:bg-white/[0.04] transition-all">
                        <FiFolder className="text-blue-400" />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-200">pigeon_report_2.4.pdf</span>
                          <span className="text-[10px] text-slate-500 font-bold">3.2 MB</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Chat Input */}
              <div className="h-18 border-t border-white/5 px-4 flex items-center gap-3 bg-white/[0.005]">
                <input 
                  type="text" 
                  placeholder="Message #general-chat..." 
                  className="flex-1 bg-white/[0.02] border border-white/5 focus:outline-none rounded-xl py-3 px-4 text-[13px] text-slate-300 placeholder-slate-650"
                  disabled
                />
                <button className="p-2 text-slate-500 hover:text-blue-400 transition-colors">🎤</button>
                <button className="bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-500 transition-all flex items-center justify-center">
                  <FiArrowRight size={14} />
                </button>
              </div>

            </div>
          </div>
        </motion.div>
      </section>

      {/* "Designed for Professionals" Section */}
      <section className="bg-[#0b1020]/80 border-t border-white/5 py-24 px-6 md:px-12 text-center relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <div className="max-w-3xl mb-20">
            <h2 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent mb-4">
              Engineered for absolute speed.
            </h2>
            <p className="text-slate-400 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
              Everything you need from a modern messaging suite. Tailored for creative builders, high-performance startups, and fluid collaboration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
            
            {/* Card 1 */}
            <motion.div 
              whileHover={{ y: -6 }}
              className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl flex flex-col items-start text-left hover:border-blue-500/20 hover:bg-white/[0.03] transition-all duration-300 shadow-xl group"
            >
              <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 mb-6 shadow-lg group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                <FiZap size={20} />
              </div>
              <h3 className="font-extrabold text-lg text-white mb-3">Ultra Low Latency</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Powered by optimized custom WebSocket layers. Chat updates, typing indicators, and attachments trigger instantly across sessions.
              </p>
            </motion.div>

            {/* Card 2 */}
            <motion.div 
              whileHover={{ y: -6 }}
              className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl flex flex-col items-start text-left hover:border-purple-500/20 hover:bg-white/[0.03] transition-all duration-300 shadow-xl group"
            >
              <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center text-purple-400 mb-6 shadow-lg group-hover:bg-purple-500 group-hover:text-white transition-all duration-300">
                <FiShield size={20} />
              </div>
              <h3 className="font-extrabold text-lg text-white mb-3">E2E Session Security</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                All data, credentials, and attachments are processed with strict browser-level encryption before hitting the cloud database.
              </p>
            </motion.div>

            {/* Card 3 */}
            <motion.div 
              whileHover={{ y: -6 }}
              className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl flex flex-col items-start text-left hover:border-cyan-500/20 hover:bg-white/[0.03] transition-all duration-300 shadow-xl group"
            >
              <div className="w-12 h-12 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl flex items-center justify-center text-cyan-400 mb-6 shadow-lg group-hover:bg-cyan-500 group-hover:text-white transition-all duration-300">
                <FiSmartphone size={20} />
              </div>
              <h3 className="font-extrabold text-lg text-white mb-3">Adaptive Platform scaling</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Transitions smoothly from large 4K multi-panel desktop screens to touch-friendly, adaptive drawers on smartphones.
              </p>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Testimonial Block */}
      <section className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white py-20 px-6 md:px-12 text-center relative z-10 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05),transparent_60%)]" />
        
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-6 relative z-10">
          
          {/* Avatar stack */}
          <div className="flex items-center -space-x-3">
            <img referrerPolicy="no-referrer" className="w-11 h-11 rounded-full border-2 border-indigo-700 object-cover shadow-lg" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face" alt="User" />
            <img referrerPolicy="no-referrer" className="w-11 h-11 rounded-full border-2 border-indigo-700 object-cover shadow-lg" src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop&crop=face" alt="User" />
            <img referrerPolicy="no-referrer" className="w-11 h-11 rounded-full border-2 border-indigo-700 object-cover shadow-lg" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" alt="User" />
            <div className="w-11 h-11 rounded-full border-2 border-indigo-700 bg-white/10 text-white font-extrabold text-xs flex items-center justify-center shadow-inner backdrop-blur-sm">
              +18k
            </div>
          </div>

          <p className="text-xl md:text-3xl font-medium max-w-3xl leading-relaxed italic text-indigo-50">
            "The web interface is spectacular. It feels faster, more responsive, and aesthetically superior to most native desktop applications out there."
          </p>

          <span className="text-[14px] font-black uppercase tracking-widest text-cyan-300">
            Jordan T., Lead Designer at Velocity Labs
          </span>

        </div>
      </section>

      {/* Ready to take flight section */}
      <section className="py-24 px-6 md:px-12 relative z-10 bg-[#0B1020]">
        <div className="max-w-4xl mx-auto bg-gradient-to-b from-white/[0.02] to-white/[0.005] border border-white/5 p-12 rounded-[2.5rem] text-center shadow-2xl flex flex-col items-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-blue-500/5 blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
          
          <h2 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent mb-4">
            Ready to take flight?
          </h2>
          
          <p className="text-slate-400 text-base leading-relaxed max-w-xl mb-8 font-medium">
            Join over 1 million teams worldwide who trust Pigeon for secure real-time messaging. Setup takes less than 30 seconds.
          </p>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/register')}
            className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:via-indigo-500 hover:to-cyan-400 text-white font-extrabold py-4.5 px-12 rounded-2xl shadow-xl shadow-blue-500/10 hover:shadow-blue-500/25 transition-all duration-200 uppercase tracking-widest text-xs font-black"
          >
            Launch Pigeon Web App
          </motion.button>

          {/* Core pillars indicators below button */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-slate-500 text-[12px] font-extrabold mt-12">
            <div className="flex items-center gap-2">
              <FiShield className="text-blue-500" /> SECURE DATABASES
            </div>
            <div className="flex items-center gap-2">
              <FiCpu className="text-blue-500" /> ULTRA LOW LATENCY
            </div>
            <div className="flex items-center gap-2">
              <FiServer className="text-blue-500" /> DEVELOPER API
            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-[#070b16] border-t border-white/5 pt-16 pb-8 px-6 md:px-12 relative z-10 text-[14px]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-16 text-left">
          
          {/* Col 1 */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <PigeonLogo className="w-8 h-8 rounded-lg" variant="gradient" />
              <span className="font-extrabold text-xl text-white tracking-wide">Pigeon</span>
            </div>
            <p className="text-slate-500 leading-relaxed text-sm">
              Built for speed, security, and global scale. The next generation of real-time web messaging has arrived.
            </p>
            <div className="flex items-center gap-4 text-slate-500 mt-2">
              <a href="#" className="hover:text-blue-450 transition-colors"><FiTwitter size={18} /></a>
              <a href="#" className="hover:text-blue-450 transition-colors"><FiGithub size={18} /></a>
            </div>
          </div>

          {/* Col 2 */}
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-white mb-1 uppercase tracking-wider text-xs text-slate-400">Product</h4>
            <a href="#" className="text-slate-500 hover:text-white font-semibold transition-colors">Features</a>
            <a href="#" className="text-slate-500 hover:text-white font-semibold transition-colors">Web App</a>
            <a href="#" className="text-slate-500 hover:text-white font-semibold transition-colors">Mobile Support</a>
            <a href="#" className="text-slate-500 hover:text-white font-semibold transition-colors">Browser Extension</a>
            <a href="#" className="text-slate-500 hover:text-white font-semibold transition-colors">Enterprise</a>
          </div>

          {/* Col 3 */}
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-white mb-1 uppercase tracking-wider text-xs text-slate-400">Support</h4>
            <a href="#" className="text-slate-500 hover:text-white font-semibold transition-colors">Help Center</a>
            <a href="#" className="text-slate-500 hover:text-white font-semibold transition-colors">Security Audit</a>
            <a href="#" className="text-slate-500 hover:text-white font-semibold transition-colors">Privacy Policy</a>
            <a href="#" className="text-slate-500 hover:text-white font-semibold transition-colors">Terms of Service</a>
            <a href="#" className="text-slate-500 hover:text-white font-semibold transition-colors">Status</a>
          </div>

          {/* Col 4 */}
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-white mb-1 uppercase tracking-wider text-xs text-slate-400">Company</h4>
            <a href="#" className="text-slate-500 hover:text-white font-semibold transition-colors">About Us</a>
            <a href="#" className="text-slate-500 hover:text-white font-semibold transition-colors">Careers</a>
            <a href="#" className="text-slate-500 hover:text-white font-semibold transition-colors">Developer Blog</a>
            <a href="#" className="text-slate-500 hover:text-white font-semibold transition-colors">Press Kit</a>
            <a href="#" className="text-slate-500 hover:text-white font-semibold transition-colors">Contact</a>
          </div>

        </div>

        <div className="max-w-6xl mx-auto border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between text-slate-550 text-xs">
          <span>&copy; {new Date().getFullYear()} Pigeon Chat Messaging Foundation. All rights reserved.</span>
          <div className="flex gap-4 mt-4 md:mt-0 font-bold text-slate-500">
            <span>Server: Stable-1.0.1</span>
            <span>Version: 2.4.0-stable</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
