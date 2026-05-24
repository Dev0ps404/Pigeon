import React from 'react';

/**
 * Premium, Futuristic Pigeon Brand Logo Component
 * Highly engineered geometric pigeon/chat hybrid symbol forming a hidden letter "P"
 * Inspired by modern luxury tech startups (Apple, Linear, Discord).
 * Supports several variants:
 * - "gradient" (default): Premium full-color abstract symbol with electric blue/cyan/purple gradients
 * - "silhouette": Clean vector path in solid color matching the color prop
 * - "app-icon": App icon variant inside a glassmorphic rounded square with soft ambient glow
 * - "sidebar": Specially optimized for navigation sidebars
 * - "monochrome": Minimal monochrome white/black variant
 */
export const PigeonLogo = ({ className = "w-6 h-6", size, variant = "gradient", color = "currentColor" }) => {
  const styles = size ? { width: size, height: size } : {};

  // Clean geometric paths representing:
  // 1. Left stem (P-stem): A vertical rounded capsule
  // 2. Loop/Bubble (P-loop & Pigeon head): A circular chat bubble loop with a sleek, forward beak/arrow
  // 3. Curved wing (Pigeon flight & Chat tail): An elegant sweeping wing curve below
  const renderSymbol = (fillColor) => (
    <g className="pigeon-symbol-group">
      {/* 1. Left Stem of the "P" */}
      <rect 
        x="22" 
        y="20" 
        width="9" 
        height="60" 
        rx="4.5" 
        fill={fillColor} 
      />

      {/* 2. Top Chat Loop / Pigeon Head & Beak */}
      <path 
        d="M 31 20 
           C 52 20, 68 32, 68 47 
           C 68 54, 61 60, 52 64 
           L 58 74 
           L 46 67 
           C 41 68, 36 68, 31 68 
           C 27 68, 27 60, 31 60 
           C 35 60, 40 59, 44 57 
           C 52 54, 58 48, 58 41 
           C 58 32, 46 29, 31 29 
           C 27 29, 27 20, 31 20 Z" 
        fill={fillColor} 
      />

      {/* 3. Futuristic Wing / Abstract Messenger swoosh */}
      <path 
        d="M 31 43 
           C 46 43, 76 46, 76 60 
           C 76 74, 52 80, 38 80 
           C 34 80, 34 71, 38 71 
           C 48 71, 65 67, 65 60 
           C 65 54, 46 52, 31 52 
           C 27 52, 27 43, 31 43 Z" 
        fill={fillColor} 
      />

      {/* 4. Elegant circular bird eye / center glowing anchor */}
      <circle 
        cx="44" 
        cy="36" 
        r="3" 
        fill={variant === "silhouette" && color !== "white" ? "white" : "url(#pigeonEyeGlow)"} 
      />
    </g>
  );

  if (variant === "silhouette") {
    return (
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={styles}
      >
        <defs>
          <linearGradient id="pigeonEyeGlow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
        {renderSymbol(color)}
      </svg>
    );
  }

  if (variant === "monochrome") {
    return (
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={styles}
      >
        <defs>
          <linearGradient id="pigeonEyeGlow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#cccccc" />
          </linearGradient>
        </defs>
        {renderSymbol("#ffffff")}
      </svg>
    );
  }

  if (variant === "app-icon") {
    return (
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={styles}
      >
        <defs>
          {/* Main Logo Gradient */}
          <linearGradient id="pigeonBrandGrad" x1="22" y1="20" x2="76" y2="80" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#06b6d4" />      {/* Electric Cyan */}
            <stop offset="50%" stopColor="#2563eb" />     {/* Royal Blue */}
            <stop offset="100%" stopColor="#a855f7" />    {/* Purple Accent */}
          </linearGradient>

          {/* Ambient Glow Gradient */}
          <radialGradient id="pigeonBgGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#0B1020" stopOpacity="0" />
          </radialGradient>

          {/* Bird Eye Anchor */}
          <linearGradient id="pigeonEyeGlow" x1="41" y1="33" x2="47" y2="39" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>

          {/* Dark Glass Frame Gradient */}
          <linearGradient id="pigeonGlassFrame" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.08)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.02)" />
          </linearGradient>
        </defs>

        {/* Ambient Back Glow */}
        <circle cx="50" cy="50" r="45" fill="url(#pigeonBgGlow)" />

        {/* Rounded Glassmorphic App Icon Frame */}
        <rect 
          x="2" 
          y="2" 
          width="96" 
          height="96" 
          rx="24" 
          fill="#111827" 
          fillOpacity="0.75" 
          stroke="url(#pigeonGlassFrame)" 
          strokeWidth="1.5" 
        />

        {/* Inner Symbol with gradient */}
        {renderSymbol("url(#pigeonBrandGrad)")}
      </svg>
    );
  }

  // Default: premium full-color gradient logo inside a transparent container
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={styles}
    >
      <defs>
        {/* Main Logo Gradient */}
        <linearGradient id="pigeonBrandGrad" x1="22" y1="20" x2="76" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#06b6d4" />      {/* Electric Cyan */}
          <stop offset="50%" stopColor="#2563eb" />     {/* Royal Blue */}
          <stop offset="100%" stopColor="#a855f7" />    {/* Purple Accent */}
        </linearGradient>

        {/* Soft Back Shadow for depth */}
        <filter id="pigeonBrandShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#2563eb" floodOpacity="0.15" />
        </filter>

        {/* Bird Eye Anchor */}
        <linearGradient id="pigeonEyeGlow" x1="41" y1="33" x2="47" y2="39" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
      </defs>
      
      <g filter="url(#pigeonBrandShadow)">
        {renderSymbol("url(#pigeonBrandGrad)")}
      </g>
    </svg>
  );
};

export default PigeonLogo;
