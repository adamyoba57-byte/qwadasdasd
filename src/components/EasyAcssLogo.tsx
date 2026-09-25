import React from 'react';

interface EasyAcssLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
}

export const EasyAcssLogo: React.FC<EasyAcssLogoProps> = ({
  size = 'md',
  showSubtitle = false,
  className = ''
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Insignia Icon Container with neon glow */}
      <div className={`relative ${iconSizes[size]} shrink-0 flex items-center justify-center`}>
        {/* Ambient neon backlight glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-600 via-indigo-500 to-cyan-400 rounded-xl blur-sm opacity-60 group-hover:opacity-100 transition-opacity" />

        {/* Outer Hexagon Shield Badge */}
        <div className="relative w-full h-full rounded-xl bg-[#0d1017] border border-white/20 p-1 flex items-center justify-center shadow-lg group-hover:border-purple-400/50 transition-colors">
          <svg
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            <defs>
              <linearGradient id="easyGradPrimary" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
              <linearGradient id="easyGradAccent" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#c084fc" />
              </linearGradient>
            </defs>

            {/* Stylized 'E' + 'A' Vault Key geometric lines */}
            <path
              d="M10 11C10 9.89543 10.8954 9 12 9H27C28.1046 9 29 9.89543 29 11V14C29 14.5523 28.5523 15 28 15H17V18H25C25.5523 18 26 18.4477 26 19V21C26 21.5523 25.5523 22 25 22H17V26H28C28.5523 26 29 26.4477 29 27V30C29 30.5523 28.5523 31 28 31H12C10.8954 31 10 30.1046 10 29V11Z"
              fill="url(#easyGradPrimary)"
            />
            {/* Cyber keyhole / energy node diamond */}
            <rect
              x="26"
              y="18"
              width="5"
              height="5"
              rx="1.5"
              fill="url(#easyGradAccent)"
              className="animate-pulse"
            />
          </svg>
        </div>
      </div>

      {/* Brand Text */}
      <div className="flex flex-col justify-center leading-none">
        <div className={`font-black tracking-tight ${textSizes[size]} font-sans flex items-center`}>
          <span className="text-white group-hover:text-slate-100 transition-colors">
            Easy
          </span>
          <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent ml-0.5 font-black">
            Acss
          </span>
        </div>
        {showSubtitle && (
          <span className="text-[9px] font-mono font-bold tracking-widest text-slate-400 uppercase mt-0.5">
            Gaming Vault
          </span>
        )}
      </div>
    </div>
  );
};
