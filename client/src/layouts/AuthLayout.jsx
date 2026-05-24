import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import PigeonLogo from '../components/Logo';

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[#0B1020] text-white transition-colors duration-500">
      
      {/* Dynamic Drifting Background Gradient Blobs (Ambient Lights) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Blob 1 */}
        <motion.div
          animate={{
            x: [0, 40, -20, 0],
            y: [0, -60, 40, 0],
            scale: [1, 1.15, 0.9, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] max-w-[500px] max-h-[500px] rounded-full bg-indigo-600/15 blur-[80px] md:blur-[120px]"
        />

        {/* Blob 2 */}
        <motion.div
          animate={{
            x: [0, -50, 30, 0],
            y: [0, 40, -60, 0],
            scale: [1, 0.9, 1.1, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -bottom-[10%] -right-[10%] w-[55vw] h-[55vw] max-w-[600px] max-h-[600px] rounded-full bg-purple-600/15 blur-[100px] md:blur-[140px]"
        />

        {/* Blob 3 */}
        <motion.div
          animate={{
            x: [0, 30, -30, 0],
            y: [0, 50, 30, 0],
            scale: [1, 1.05, 0.95, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-[40%] left-[20%] w-[35vw] h-[35vw] max-w-[400px] max-h-[400px] rounded-full bg-cyan-500/10 blur-[80px] md:blur-[100px]"
        />
      </div>

      {/* Decorative Grid Lines to add high-tech/futuristic look */}
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

      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        
        {/* Floating Futuristic Bird Logo Box */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
          className="w-20 h-20 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[1.5rem] flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.4)] mb-8 transition-all duration-300 hover:border-blue-500/30 hover:shadow-[0_20px_50px_rgba(37,99,235,0.15)] group cursor-pointer"
        >
          <div className="w-14 h-14 bg-gradient-to-tr from-blue-600/20 to-purple-600/20 rounded-[1.1rem] flex items-center justify-center border border-white/5 relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 to-cyan-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <PigeonLogo className="w-9 h-9 relative z-10" variant="silhouette" color="#60a5fa" />
          </div>
        </motion.div>

        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
