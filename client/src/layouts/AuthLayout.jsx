import { Outlet, Link } from "react-router-dom";
import { motion } from "framer-motion";
import PigeonLogo from "../components/Logo";
import { FiActivity, FiTrendingUp } from "react-icons/fi";

const AuthLayout = () => {
  return (
    <div
      className="min-h-screen w-full bg-[#F6F7FB] text-slate-900 relative overflow-hidden"
      style={{ fontFamily: '"Plus Jakarta Sans", "Space Grotesk", sans-serif' }}
    >
      <div className="min-h-screen grid lg:grid-cols-[1fr_1.25fr]">
        {/* Left Panel */}
        <div className="relative z-10 flex flex-col justify-between px-6 py-6 lg:px-12 lg:py-8 bg-white/95 backdrop-blur-sm border-r border-slate-100">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <PigeonLogo
                className="w-10 h-10 rounded-2xl shadow-lg shadow-indigo-500/15"
                variant="gradient"
              />
              <div className="flex flex-col leading-tight">
                <span className="text-lg font-extrabold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Pigeon
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
                  Secure Chat
                </span>
              </div>
            </Link>
            <a
              href="mailto:support@pigeon.chat"
              className="text-[11px] font-semibold tracking-widest text-slate-400 hover:text-indigo-600 uppercase transition-colors"
            >
              Need Help?
            </a>
          </div>

          <div className="my-auto py-4 max-w-sm w-full mx-auto">
            <Outlet />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-[11px] font-semibold text-slate-400 pt-5 border-t border-slate-100">
            <span>&copy; {new Date().getFullYear()} Pigeon Labs</span>
            <div className="flex gap-4">
              <a href="#" className="hover:text-slate-600 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-slate-600 transition-colors">
                Terms
              </a>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="hidden lg:flex relative items-center justify-center overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1400&q=80')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/70 via-slate-900/45 to-slate-900/65" />

          <div className="absolute -top-16 -left-16 w-80 h-80 bg-indigo-500/30 blur-3xl rounded-full" />
          <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-sky-400/30 blur-3xl rounded-full" />

          <div
            className="absolute inset-0 opacity-[0.08] pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(rgba(255, 255, 255, 0.3) 1px, transparent 1px)",
              backgroundSize: "26px 26px",
            }}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="relative z-10 w-[78%] max-w-lg rounded-[32px] bg-white/15 border border-white/20 backdrop-blur-2xl p-7 shadow-2xl"
          >
            <div className="w-12 h-1.5 bg-gradient-to-r from-emerald-300 to-cyan-300 rounded-full mb-5" />
            <h2
              className="text-2xl md:text-3xl font-bold text-white leading-snug tracking-tight mb-4"
              style={{ fontFamily: '"Space Grotesk", sans-serif' }}
            >
              Powering real-time conversations.
            </h2>
            <p className="text-sm text-white/70 leading-relaxed mb-5">
              Stay connected with low-latency messaging, presence, and smart
              delivery.
            </p>
            <div className="flex items-center gap-3 pt-5 border-t border-white/20">
              <div className="flex items-center -space-x-3">
                <div className="w-9 h-9 rounded-full bg-white/30 border border-white/40 flex items-center justify-center text-white text-[10px] font-extrabold">
                  JB
                </div>
                <div className="w-9 h-9 rounded-full bg-indigo-500/70 border border-white/40 flex items-center justify-center text-white text-[10px] font-extrabold">
                  MK
                </div>
                <div className="w-9 h-9 rounded-full bg-emerald-400/70 border border-white/40 flex items-center justify-center text-white text-[9px] font-extrabold">
                  +12k
                </div>
              </div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-white/70">
                Join 12,000+ users daily
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.5 }}
            className="absolute bottom-12 right-12 bg-white/15 border border-white/20 py-4 px-5 rounded-2xl shadow-xl backdrop-blur-lg z-10 flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-400/20 border border-emerald-300/40 flex items-center justify-center text-emerald-200">
              <FiTrendingUp size={18} />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                Delivery Rate
              </span>
              <span className="text-[14px] font-extrabold text-white">
                99.98%
                <span className="text-emerald-300 text-xs font-bold ml-2">
                  +0.02%
                </span>
              </span>
            </div>
          </motion.div>

          <div className="absolute top-10 right-16 flex items-center gap-2 text-white/70 text-xs font-semibold">
            <FiActivity size={14} className="text-emerald-300" />
            Live activity monitored
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
