import React from 'react';

/**
 * Premium, custom Pigeon Logo Component
 * Supports two variants:
 * - "gradient" (default): White pigeon silhouette inside a beautiful blue gradient circle
 * - "silhouette": Just the clean pigeon silhouette path
 */
export const PigeonLogo = ({ className = "w-6 h-6", size, variant = "gradient", color = "currentColor" }) => {
  const styles = size ? { width: size, height: size } : {};

  if (variant === "silhouette") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={styles}
      >
        {/* Sleek Modern Pigeon silhouette */}
        <path 
          d="M15.5 10c.2 0 .4-.1.4-.4V8.5c0-.4-.2-.8-.6-1L13.5 6.7C12.3 6.1 11.1 6 10 6c-3.3 0-6 2.7-6 6s2.7 6 6 6c1.7 0 3.2-.7 4.3-1.7l.4-.4c.1-.1.1-.4 0-.5l-1.5-1.5c-.1-.1-.4-.1-.5 0l-.2.2c-.6.6-1.5 1-2.5 1-1.9 0-3.5-1.6-3.5-3.5S7.6 9 9.5 9h6z" 
          fill={color} 
        />
        {/* Tiny eye */}
        <circle cx="9" cy="8" r="0.6" fill={color === "white" ? "#2563eb" : "white"} />
      </svg>
    );
  }

  // Default: premium circular gradient logo
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={styles}
    >
      <circle cx="12" cy="12" r="10" fill="url(#pigeonLogoGrad)" />
      <path 
        d="M15.5 10c.2 0 .4-.1.4-.4V8.5c0-.4-.2-.8-.6-1L13.5 6.7C12.3 6.1 11.1 6 10 6c-3.3 0-6 2.7-6 6s2.7 6 6 6c1.7 0 3.2-.7 4.3-1.7l.4-.4c.1-.1.1-.4 0-.5l-1.5-1.5c-.1-.1-.4-.1-.5 0l-.2.2c-.6.6-1.5 1-2.5 1-1.9 0-3.5-1.6-3.5-3.5S7.6 9 9.5 9h6z" 
        fill="white" 
      />
      <circle cx="9" cy="8" r="0.6" fill="#1e40af" />
      <defs>
        <linearGradient id="pigeonLogoGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#2563eb" />
          <stop offset="100%" stop-color="#1d4ed8" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default PigeonLogo;
