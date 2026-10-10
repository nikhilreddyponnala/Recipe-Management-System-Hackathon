import React from 'react';

interface RecipeHubLogoProps {
  className?: string;
  variant?: 'full' | 'compact' | 'icon' | 'badge';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  light?: boolean;
}

export const RecipeHubLogo: React.FC<RecipeHubLogoProps> = ({
  className = '',
  variant = 'compact',
  size = 'md',
  light = false,
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* RecipeHub Emblem Icon */}
      <div className="relative shrink-0 flex items-center justify-center">
        <svg
          viewBox="0 0 160 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`${iconSizes[size]} shrink-0 transition-transform hover:scale-105`}
        >
          <defs>
            <linearGradient id="hubFlame" x1="40" y1="20" x2="120" y2="140" gradientUnits="userSpaceOnUse">
              <stop stopColor="#EA580C" />
              <stop offset="0.6" stopColor="#E86A33" />
              <stop offset="1" stopColor="#C2410C" />
            </linearGradient>
            <linearGradient id="hubLeaf" x1="60" y1="60" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop stopColor="#84CC16" />
              <stop offset="1" stopColor="#15803D" />
            </linearGradient>
            <filter id="hubGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#EA580C" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Skillet / Serving Bowl Base */}
          <path
            d="M32 94C30 114 48 134 80 134C112 134 130 114 128 94C120 98 108 102 92 101C72 100 50 94 32 94Z"
            fill="url(#hubFlame)"
            filter="url(#hubGlow)"
          />

          {/* Chef Hat Toque Crown */}
          <path
            d="M44 60C40 50 42 38 52 30C58 24 67 24 72 29C77 18 91 16 100 22C108 27 110 36 107 43C116 46 120 54 117 62C112 64 98 62 80 61C60 60 48 61 44 60Z"
            fill="#FFFFFF"
            stroke="#0F472B"
            strokeWidth="4.5"
            strokeLinejoin="round"
          />

          {/* Steam Swirls */}
          <path
            d="M96 22C98 16 95 11 92 7"
            stroke="#EA580C"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d="M106 25C108 18 105 13 103 9"
            stroke="#F97316"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Chef Hat Band */}
          <path
            d="M48 60C62 57 85 57 112 61"
            stroke="#0F472B"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Crossed Fork & Spoon in Golden Bronze */}
          {/* Fork */}
          <path
            d="M62 70L98 106"
            stroke="#0F472B"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M58 64L64 70M62 61L67 66M65 59L71 64"
            stroke="#0F472B"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Spoon */}
          <path
            d="M98 70L62 106"
            stroke="#EA580C"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <ellipse
            cx="101"
            cy="67"
            rx="6"
            ry="8"
            transform="rotate(45 101 67)"
            fill="#EA580C"
          />

          {/* Fresh Organic Green Leaf Sprout */}
          <path
            d="M80 78C74 86 78 98 88 98C98 98 100 86 92 78C88 84 84 86 80 78Z"
            fill="url(#hubLeaf)"
          />
        </svg>
      </div>

      {/* Brand Typography */}
      {variant !== 'icon' && (
        <div className="flex flex-col text-left leading-none select-none">
          <div className={`font-['Plus_Jakarta_Sans',sans-serif] font-black tracking-tight ${textSizes[size]}`}>
            <span className={light ? 'text-white' : 'text-[#0F472B]'}>
              Recipe
            </span>
            <span className="text-[#EA580C] ml-0.5 inline-flex items-center">
              Hub
              {/* Vibrant Hub Dot / Badge */}
              <span className="inline-block w-2 h-2 ml-1 rounded-full bg-[#EA580C] animate-pulse" />
            </span>
          </div>

          {(variant === 'full' || variant === 'badge') && (
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] font-bold tracking-[0.22em] text-[#0F472B]/85 uppercase">
                Discover
              </span>
              <span className="text-[#EA580C] text-[10px] font-black">·</span>
              <span className="text-[10px] font-bold tracking-[0.22em] text-[#0F472B]/85 uppercase">
                Save
              </span>
              <span className="text-[#EA580C] text-[10px] font-black">·</span>
              <span className="text-[10px] font-bold tracking-[0.22em] text-[#EA580C] uppercase">
                Cook
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
