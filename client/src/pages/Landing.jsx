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

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f8fbfe] text-[#2c3e50] font-sans antialiased selection:bg-blue-100 relative overflow-x-hidden">
      
      {/* Decorative top soft background gradient */}
      <div className="absolute top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-[#e3f2fd]/50 to-transparent pointer-events-none z-0" />

      {/* Navigation Header */}
      <header className="w-full h-20 px-6 md:px-12 flex items-center justify-between border-b border-[#e2e8f0] bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#0066cc] rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>
          <span className="font-bold text-2xl tracking-tight text-[#0f172a]">
            Pigeon
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link 
            to="/login" 
            className="text-[#64748b] hover:text-[#0f172a] font-semibold transition-colors py-2 px-4 text-[15px]"
          >
            Sign In
          </Link>
          <Link 
            to="/register" 
            className="bg-[#0066cc] hover:bg-[#0052a3] text-white font-bold py-2.5 px-6 rounded-xl shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 text-[15px]"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 pt-16 pb-12 flex flex-col items-center text-center relative z-10">
        
        {/* Top Announcement Pill */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-[#e3f2fd] border border-[#bbdefb] py-1.5 px-4 rounded-full text-[#0066cc] text-[13px] font-bold mb-6"
        >
          <span>✉️</span> Web App v2.4 out now with Voice Messaging
        </motion.div>

        {/* Big Bold Headline */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-6xl font-extrabold text-[#0f172a] tracking-tight leading-[1.15] max-w-4xl mb-6"
        >
          The world's most powerful<br />
          <span className="italic text-[#0066cc] font-medium">messaging platform</span>, in your<br />
          browser.
        </motion.h1>

        {/* Hero Subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-[16px] md:text-[18px] text-[#475569] max-w-2xl mb-8 leading-relaxed font-normal"
        >
          No downloads required. Secure, real-time communication for professional teams and<br className="hidden md:inline" />
          individuals. Open instantly on your browser and mobile devices.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 mb-6 w-full sm:w-auto"
        >
          <button 
            onClick={() => navigate('/register')}
            className="w-full sm:w-auto bg-[#0066cc] hover:bg-[#0052a3] text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2"
          >
            Open Pigeon Web <FiArrowRight size={18} />
          </button>
          <button 
            onClick={() => navigate('/login')}
            className="w-full sm:w-auto bg-white hover:bg-gray-50 text-[#0f172a] border border-[#cbd5e1] font-semibold py-4 px-8 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
          >
            View Enterprise Demo
          </button>
        </motion.div>

        {/* Trust Checkboxes */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex items-center gap-6 text-[#64748b] text-[13px] font-semibold mb-16"
        >
          <div className="flex items-center gap-1.5">
            <span className="text-green-500 text-lg">✓</span> No install required
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-green-500 text-lg">✓</span> End-to-end encrypted
          </div>
        </motion.div>

        {/* Browser Mockup Visual Showcase */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 50, delay: 0.4 }}
          className="w-full max-w-5xl rounded-2xl border border-[#e2e8f0] bg-white p-3 shadow-[0_20px_50px_rgba(15,23,42,0.08)] relative"
        >
          {/* Top Address Bar Row */}
          <div className="flex items-center gap-2 px-3 pb-3 border-b border-[#f1f5f9] mb-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <div className="flex-1 max-w-sm mx-auto bg-[#f1f5f9] rounded-lg py-1 px-3 text-xs text-[#94a3b8] flex items-center gap-1 justify-center">
              <span>🔒</span> pigeon.com/workspace
            </div>
          </div>

          {/* Inner Web App Representation */}
          <div className="rounded-xl overflow-hidden aspect-[16/9] bg-[#f8fafc] flex border border-[#e2e8f0] shadow-inner text-left">
            
            {/* Mock Sidebar */}
            <div className="w-64 border-r border-[#e2e8f0] bg-white p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-6">
                  <div className="w-7 h-7 bg-[#0066cc] rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </div>
                  <span className="font-bold text-base text-[#0f172a]">Pigeon Tech</span>
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-3 px-3 py-2.5 bg-[#e3f2fd] rounded-xl text-[#0066cc] font-bold text-[14px]">
                    <span>💬</span> Messages
                    <span className="ml-auto bg-[#0066cc] text-white text-[10px] px-1.5 py-0.5 rounded-full font-extrabold">3</span>
                  </div>
                  <div className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-xl text-[#64748b] text-[14px] font-semibold">
                    <span>👥</span> Channels
                  </div>
                  <div className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-xl text-[#64748b] text-[14px] font-semibold">
                    <span>📞</span> Calls
                  </div>
                  <div className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-xl text-[#64748b] text-[14px] font-semibold">
                    <span>📁</span> Files
                  </div>
                </div>
              </div>

              {/* Sidebar Profile Card */}
              <div className="flex items-center gap-3 p-1.5 bg-gray-50 rounded-xl border border-gray-100">
                <div className="relative">
                  <img referrerPolicy="no-referrer" 
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face" 
                    alt="Susan" 
                    className="w-9 h-9 rounded-full object-cover" 
                  />
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-[#0f172a] leading-tight">Susan Miller</span>
                  <span className="text-[11px] text-[#22c55e] font-semibold">Active</span>
                </div>
              </div>
            </div>

            {/* Mock Chat Area */}
            <div className="flex-1 flex flex-col bg-white">
              {/* Header */}
              <div className="h-16 border-b border-[#e2e8f0] px-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-base text-[#0f172a]">Pigeon General Chat 🕊️</span>
                </div>
                <div className="flex items-center gap-3 text-[#64748b]">
                  <FiSearch className="cursor-pointer hover:text-[#0f172a]" />
                  <FiPhone className="cursor-pointer hover:text-[#0f172a]" />
                  <FiVideo className="cursor-pointer hover:text-[#0f172a]" />
                  <FiSidebar className="cursor-pointer hover:text-[#0f172a]" />
                </div>
              </div>

              {/* Chat Message Thread */}
              <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto bg-gray-50/50">
                
                {/* Message 1 */}
                <div className="flex items-start gap-3">
                  <img referrerPolicy="no-referrer" 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" 
                    alt="Mark" 
                    className="w-8 h-8 rounded-full object-cover" 
                  />
                  <div className="flex flex-col gap-1 max-w-[70%]">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-bold text-[#0f172a]">Mark R.</span>
                      <span className="text-[10px] text-[#94a3b8]">11:02 am</span>
                    </div>
                    <div className="p-3 bg-white border border-[#e2e8f0] rounded-2xl rounded-tl-sm text-[13px] text-[#334155] leading-relaxed shadow-sm">
                      Hey everyone! Just letting you know I'll be out for lunch in 15 minutes. Ping me here if anything is urgent before that! 🚀
                    </div>
                  </div>
                </div>

                {/* Message 2 (Outgoing) */}
                <div className="flex items-start gap-3 justify-end">
                  <div className="flex flex-col gap-1 max-w-[70%] items-end">
                    <div className="flex items-center gap-2 justify-end">
                      <span className="text-[10px] text-[#94a3b8]">11:03 am</span>
                      <span className="text-[13px] font-bold text-[#0f172a]">Me</span>
                    </div>
                    <div className="p-3 bg-[#0066cc] text-white rounded-2xl rounded-tr-sm text-[13px] leading-relaxed shadow-sm">
                      Perfect! We've hit 500k active daily users. It's incredibly responsive. The Pigeon engine is really flying now. 🕊️
                    </div>
                  </div>
                  <img referrerPolicy="no-referrer" 
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face" 
                    alt="Me" 
                    className="w-8 h-8 rounded-full object-cover" 
                  />
                </div>

                {/* Message 3 */}
                <div className="flex items-start gap-3">
                  <img referrerPolicy="no-referrer" 
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face" 
                    alt="Dev" 
                    className="w-8 h-8 rounded-full object-cover" 
                  />
                  <div className="flex flex-col gap-1 max-w-[70%]">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-bold text-[#0f172a]">Dev Sen</span>
                      <span className="text-[10px] text-[#94a3b8]">11:05 am</span>
                    </div>
                    <div className="p-3 bg-white border border-[#e2e8f0] rounded-2xl rounded-tl-sm text-[13px] text-[#334155] leading-relaxed shadow-sm">
                      Performance report is attached.
                      <div className="mt-2.5 p-2 bg-gray-50 border border-gray-100 rounded-xl flex items-center gap-2 cursor-pointer hover:bg-gray-100 transition-colors">
                        <FiFolder className="text-[#0066cc]" />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-[#0f172a]">performance_summary.pdf</span>
                          <span className="text-[10px] text-[#64748b]">3.2 Mb</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Chat Input */}
              <div className="h-16 border-t border-[#e2e8f0] px-4 flex items-center gap-3 bg-white">
                <input 
                  type="text" 
                  placeholder="Message #pigeon-general-chat" 
                  className="flex-1 bg-[#f1f5f9] border-none focus:outline-none rounded-xl py-2.5 px-4 text-[13px] text-[#334155]"
                  disabled
                />
                <button className="p-2 text-[#94a3b8] hover:text-[#0066cc]">🎤</button>
                <button className="bg-[#0066cc] text-white p-2.5 rounded-xl hover:bg-[#0052a3]">
                  <FiArrowRight size={14} />
                </button>
              </div>

            </div>
          </div>
        </motion.div>
      </section>

      {/* "Designed for Professionals" Section */}
      <section className="bg-white border-t border-[#e2e8f0] py-24 px-6 md:px-12 text-center relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <div className="max-w-2xl mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0f172a] mb-4">Designed for Professionals</h2>
            <p className="text-[#64748b] text-[15px] leading-relaxed">Everything you need from a messaging platform, perfectly tailored for creative workflows and high-speed collaboration.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
            
            {/* Card 1 */}
            <div className="p-8 bg-[#f8fbfe] border border-[#e2e8f0] rounded-2xl flex flex-col items-start text-left hover:border-blue-500/20 transition-all shadow-sm">
              <div className="w-12 h-12 bg-[#0066cc] rounded-xl flex items-center justify-center text-white mb-6 shadow-md shadow-blue-500/10">
                <FiZap size={20} />
              </div>
              <h3 className="font-bold text-lg text-[#0f172a] mb-3">Instant Web Delivery</h3>
              <p className="text-[#64748b] text-[14px] leading-relaxed">No more refreshes. Our custom websocket protocol ensures messages appear the millisecond they are sent.</p>
            </div>

            {/* Card 2 */}
            <div className="p-8 bg-[#f8fbfe] border border-[#e2e8f0] rounded-2xl flex flex-col items-start text-left hover:border-blue-500/20 transition-all shadow-sm">
              <div className="w-12 h-12 bg-[#0066cc] rounded-xl flex items-center justify-center text-white mb-6 shadow-md shadow-blue-500/10">
                <FiShield size={20} />
              </div>
              <h3 className="font-bold text-lg text-[#0f172a] mb-3">Browser-Level Encryption</h3>
              <p className="text-[#64748b] text-[14px] leading-relaxed">End-to-end routing (E2EE) happens directly in your browser. Private key storage never leaves your machine.</p>
            </div>

            {/* Card 3 */}
            <div className="p-8 bg-[#f8fbfe] border border-[#e2e8f0] rounded-2xl flex flex-col items-start text-left hover:border-blue-500/20 transition-all shadow-sm">
              <div className="w-12 h-12 bg-[#64748b] rounded-xl flex items-center justify-center text-white mb-6 shadow-md shadow-slate-500/10">
                <FiSmartphone size={20} />
              </div>
              <h3 className="font-bold text-lg text-[#0f172a] mb-3">Seamless Multi-Device</h3>
              <p className="text-[#64748b] text-[14px] leading-relaxed">Start a conversation on the train with your phone, and finish it at your desk on the web. Zero friction.</p>
            </div>

          </div>
        </div>
      </section>

      {/* Testimonial Block */}
      <section className="bg-[#005bb7] text-white py-16 px-6 md:px-12 text-center relative z-10 shadow-lg">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-6">
          
          {/* Avatar stack */}
          <div className="flex items-center -space-x-3">
            <img referrerPolicy="no-referrer" className="w-10 h-10 rounded-full border-2 border-[#005bb7] object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face" alt="User" />
            <img referrerPolicy="no-referrer" className="w-10 h-10 rounded-full border-2 border-[#005bb7] object-cover" src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop&crop=face" alt="User" />
            <img referrerPolicy="no-referrer" className="w-10 h-10 rounded-full border-2 border-[#005bb7] object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" alt="User" />
            <div className="w-10 h-10 rounded-full border-2 border-[#005bb7] bg-[#e3f2fd] text-[#0066cc] font-extrabold text-xs flex items-center justify-center shadow-inner">
              +18k
            </div>
          </div>

          <p className="text-xl md:text-2xl font-medium max-w-2xl leading-relaxed italic">
            "The best web messaging experience I've used. It's faster than most native apps."
          </p>

          <span className="text-[14px] font-semibold text-[#e3f2fd]">
            Jordan T., Lead Designer at Velocity Labs
          </span>

        </div>
      </section>

      {/* Ready to take flight section */}
      <section className="py-24 px-6 md:px-12 relative z-10 bg-[#f8fbfe]">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-[#eceff1] to-[#cfd8dc]/40 border border-[#e2e8f0] p-12 rounded-3xl text-center shadow-sm flex flex-col items-center">
          
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0f172a] mb-4">
            Ready to take flight from your desktop?
          </h2>
          
          <p className="text-[#64748b] text-[15px] leading-relaxed max-w-xl mb-8">
            Join over 1 million users worldwide who trust Pigeon for their professional and personal messaging. No signup required to try the demo.
          </p>

          <button 
            onClick={() => navigate('/register')}
            className="bg-[#0066cc] hover:bg-[#0052a3] text-white font-bold py-4 px-10 rounded-xl shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
          >
            Launch Pigeon Web App
          </button>

          {/* Core pillars indicators below button */}
          <div className="flex items-center gap-8 text-[#64748b] text-[13px] font-semibold mt-10">
            <div className="flex items-center gap-1.5">
              <FiShield className="text-[#0066cc]" /> Secure Cloud
            </div>
            <div className="flex items-center gap-1.5">
              <FiCpu className="text-[#0066cc]" /> Ultra Low Latency
            </div>
            <div className="flex items-center gap-1.5">
              <FiServer className="text-[#0066cc]" /> Developer API
            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-[#e2e8f0] pt-16 pb-8 px-6 md:px-12 relative z-10 text-[14px]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-16 text-left">
          
          {/* Col 1 */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-[#0066cc] rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <span className="font-bold text-lg text-[#0f172a]">Pigeon</span>
            </div>
            <p className="text-[#64748b] leading-relaxed">
              Built for speed, security, and global scale. The next generation of messaging is here.
            </p>
            <div className="flex items-center gap-3 text-[#64748b] mt-2">
              <a href="#" className="hover:text-[#0066cc]"><FiTwitter size={18} /></a>
              <a href="#" className="hover:text-[#0066cc]"><FiGithub size={18} /></a>
            </div>
          </div>

          {/* Col 2 */}
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-[#0f172a] mb-1">Product</h4>
            <a href="#" className="text-[#64748b] hover:text-[#0f172a] font-medium transition-colors">Features</a>
            <a href="#" className="text-[#64748b] hover:text-[#0f172a] font-medium transition-colors">Web App</a>
            <a href="#" className="text-[#64748b] hover:text-[#0f172a] font-medium transition-colors">Mobile Apps</a>
            <a href="#" className="text-[#64748b] hover:text-[#0f172a] font-medium transition-colors">Browser Extension</a>
            <a href="#" className="text-[#64748b] hover:text-[#0f172a] font-medium transition-colors">Enterprise</a>
          </div>

          {/* Col 3 */}
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-[#0f172a] mb-1">Support</h4>
            <a href="#" className="text-[#64748b] hover:text-[#0f172a] font-medium transition-colors">Help Center</a>
            <a href="#" className="text-[#64748b] hover:text-[#0f172a] font-medium transition-colors">Security</a>
            <a href="#" className="text-[#64748b] hover:text-[#0f172a] font-medium transition-colors">Privacy Policy</a>
            <a href="#" className="text-[#64748b] hover:text-[#0f172a] font-medium transition-colors">Terms of Service</a>
            <a href="#" className="text-[#64748b] hover:text-[#0f172a] font-medium transition-colors">Status</a>
          </div>

          {/* Col 4 */}
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-[#0f172a] mb-1">Company</h4>
            <a href="#" className="text-[#64748b] hover:text-[#0f172a] font-medium transition-colors">About Us</a>
            <a href="#" className="text-[#64748b] hover:text-[#0f172a] font-medium transition-colors">Careers</a>
            <a href="#" className="text-[#64748b] hover:text-[#0f172a] font-medium transition-colors">Blog</a>
            <a href="#" className="text-[#64748b] hover:text-[#0f172a] font-medium transition-colors">Contact</a>
          </div>

        </div>

        <div className="max-w-6xl mx-auto border-t border-[#e2e8f0] pt-8 flex flex-col md:flex-row items-center justify-between text-[#94a3b8] text-xs">
          <span>&copy; {new Date().getFullYear()} Pigeon Chat Messaging Foundation. All rights reserved.</span>
          <div className="flex gap-4 mt-4 md:mt-0 font-medium">
            <span>Server: Stable-1.0.1</span>
            <span>Version: 2.4.0-stable</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
