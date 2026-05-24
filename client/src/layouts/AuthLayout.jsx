import { Outlet } from 'react-router-dom';
import PigeonLogo from '../components/Logo';

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[#eef5fc] transition-colors duration-500">
      
      {/* Abstract Startup Arrow & Line Background Layer */}
      <svg className="absolute inset-0 w-full h-full object-cover opacity-70 pointer-events-none z-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 900" fill="none">
        {/* Soft glowing ambient circle orbs */}
        <circle cx="200" cy="200" r="300" fill="#bbdefb" fillOpacity="0.25" filter="blur(80px)" />
        <circle cx="1200" cy="600" r="400" fill="#90caf9" fillOpacity="0.2" filter="blur(100px)" />

        {/* Diagonal clean vector lines */}
        <path d="M-100 800L1100 -400" stroke="#0066cc" strokeWidth="8" strokeOpacity="0.05" strokeLinecap="round" />
        <path d="M0 900L1200 -300" stroke="#0066cc" strokeWidth="48" strokeOpacity="0.03" strokeLinecap="round" />
        <path d="M200 1100L1500 -200" stroke="#0066cc" strokeWidth="12" strokeOpacity="0.04" strokeLinecap="round" />
        <path d="M400 1200L1700 -100" stroke="#0066cc" strokeWidth="96" strokeOpacity="0.02" strokeLinecap="round" />

        {/* Large abstract arrow visuals mapping the screenshot */}
        <g stroke="#0066cc" strokeLinecap="round" strokeLinejoin="round">
          {/* Main central arrow */}
          <path d="M950 480 L1150 280" strokeWidth="24" strokeOpacity="0.12" />
          <path d="M1030 280 L1150 280 L1150 400" strokeWidth="24" strokeOpacity="0.12" />

          {/* Sub-arrows */}
          <path d="M1020 600 L1120 500" strokeWidth="10" strokeOpacity="0.07" />
          <path d="M1070 500 L1120 500 L1120 550" strokeWidth="10" strokeOpacity="0.07" />

          <path d="M780 320 L880 220" strokeWidth="8" strokeOpacity="0.05" />
          <path d="M830 220 L880 220 L880 270" strokeWidth="8" strokeOpacity="0.05" />
        </g>
      </svg>
      
      {/* Outer blurred container overlay backplate for glowing depth */}
      <div className="absolute w-[440px] h-[550px] bg-white/20 dark:bg-dark-card/10 backdrop-blur-md rounded-[40px] shadow-[0_20px_60px_rgba(0,102,204,0.06)] pointer-events-none z-1" />

      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        
        {/* Cute Floating Bird Logo Box */}
        <div className="w-16 h-16 bg-white border border-white/50 rounded-2xl flex items-center justify-center shadow-[0_12px_32px_rgba(0,102,204,0.08)] mb-6 transition-transform duration-300 hover:scale-105">
          <div className="w-11 h-11 bg-[#e3f2fd] rounded-xl flex items-center justify-center">
            {/* Highly visual cute pigeon silhouette facing right */}
            <PigeonLogo className="w-7 h-7" variant="silhouette" color="#0066cc" />
          </div>
        </div>

        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
