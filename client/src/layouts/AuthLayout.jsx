import { Outlet, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PigeonLogo from '../components/Logo';
import { FiLock, FiActivity, FiGlobe } from 'react-icons/fi';

const AuthLayout = () => {
  return (
    <div className="min-h-screen w-full flex bg-[#0B1020] text-white relative overflow-hidden font-sans selection:bg-blue-600/30">
      
      {/* ── LEFT PANEL (Authentication Form Section) ── */}
      <div className="w-full lg:w-[45%] flex flex-col justify-between p-6 md:p-12 bg-[#0B1020] relative z-10 border-r border-white/5">
        
        {/* Header Branding */}
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <PigeonLogo className="w-9 h-9 shadow-lg shadow-blue-500/10 rounded-xl" variant="gradient" />
            <div className="flex flex-col leading-tight">
              <span className="text-base font-extrabold tracking-wide text-white group-hover:text-blue-400 transition-colors">
                Pigeon
              </span>
              <span className="text-[9px] font-black text-slate-550 uppercase tracking-widest mt-0.5">
                Terminal
              </span>
            </div>
          </Link>
          <a 
            href="mailto:support@pigeon.chat" 
            className="text-[10px] font-extrabold tracking-widest text-slate-400 hover:text-white uppercase transition-colors"
          >
            Need Help?
          </a>
        </div>

        {/* Dynamic Outlet Form Container */}
        <div className="my-auto py-8 max-w-sm w-full mx-auto flex flex-col justify-center">
          <Outlet />
        </div>

        {/* Footer Meta Details */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-[11px] font-bold text-slate-500 mt-auto pt-6 border-t border-white/5">
          <span>&copy; {new Date().getFullYear()} Pigeon Terminal Inc.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL (Immersive Glassmorphic Showcase Section) ── */}
      <div 
        className="hidden lg:flex lg:w-[55%] relative items-center justify-center p-12 overflow-hidden bg-cover bg-center select-none"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80')`,
        }}
      >
        {/* Dark ambient glass overlay */}
        <div className="absolute inset-0 bg-[#0B1020]/50 backdrop-blur-[1px] z-0" />

        {/* Futuristic Floating Mesh Lights */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-[10%] -left-[10%] w-[40vw] h-[40vw] rounded-full bg-blue-600/20 blur-[100px] animate-pulse" />
          <div className="absolute -bottom-[10%] -right-[10%] w-[40vw] h-[40vw] rounded-full bg-purple-600/25 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        {/* Showcase Grid overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none z-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Card 1: Main Glassmorphic Product Quote & Social Proof */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
          className="bg-slate-950/40 border border-white/10 p-8 rounded-[2.5rem] shadow-2xl backdrop-blur-xl max-w-md w-full relative z-10 group hover:border-white/20 transition-all duration-300"
        >
          {/* Neon pill indicator */}
          <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mb-6" />

          <h2 className="text-2xl md:text-3xl font-extrabold text-white leading-snug tracking-tight mb-8">
            "Empowering secure connection at the speed of thought."
          </h2>

          {/* Social Proof Avatars */}
          <div className="flex items-center gap-3.5 pt-4 border-t border-white/5">
            <div className="flex items-center -space-x-3.5">
              <div className="w-9 h-9 rounded-full bg-blue-500 border border-slate-950 flex items-center justify-center font-black text-[10px] text-white">JD</div>
              <div className="w-9 h-9 rounded-full bg-purple-500 border border-slate-950 flex items-center justify-center font-black text-[10px] text-white">MI</div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-650 border border-slate-950 flex items-center justify-center font-black text-[9px] text-white shadow-inner">+12k</div>
            </div>
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
              Join 12,000+ users today
            </span>
          </div>
        </motion.div>

        {/* Card 2: Floating Real-time Stats Card at the bottom */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.5 }}
          className="absolute bottom-12 right-12 bg-slate-950/40 border border-white/10 py-3.5 px-5 rounded-2xl shadow-xl backdrop-blur-lg z-10 flex items-center gap-3.5 group hover:border-white/20 transition-all duration-300"
        >
          <div className="w-8 h-8 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 animate-pulse">
            <FiActivity size={15} />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Latency Check</span>
            <span className="text-[12px] font-black text-slate-200 tracking-wide">
              0.08ms <span className="text-green-400 font-bold ml-1">+99.9% Uptime</span>
            </span>
          </div>
        </motion.div>
      </div>

    </div>
  );
};

export default AuthLayout;
