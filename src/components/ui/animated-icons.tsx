import React from 'react';

// Generate unique IDs for each icon instance
const generateId = (prefix: string) => `${prefix}-${Math.random().toString(36).substr(2, 9)}`;

// Animated Magic Wand Icon
export const AnimatedMagicWand: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => {
  const wandGradientId = generateId('wandGradient');
  const sparkGradientId = generateId('sparkGradient');
  
  return (
    <svg viewBox="0 0 64 64" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={wandGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor: "#6366f1", stopOpacity: 1}} />
          <stop offset="50%" style={{stopColor: "#8b5cf6", stopOpacity: 1}} />
          <stop offset="100%" style={{stopColor: "#ec4899", stopOpacity: 1}} />
        </linearGradient>
        <linearGradient id={sparkGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor: "#f59e0b", stopOpacity: 1}} />
          <stop offset="100%" style={{stopColor: "#ef4444", stopOpacity: 1}} />
        </linearGradient>
      </defs>
    
      {/* Magic wand */}
      <line x1="16" y1="48" x2="48" y2="16" stroke={`url(#${wandGradientId})`} strokeWidth="4" strokeLinecap="round">
        <animate attributeName="stroke-dasharray" values="0,100;50,50;0,100" dur="2s" repeatCount="indefinite"/>
      </line>
      
      {/* Animated sparks */}
      <g>
        <path d="M52 12L48 16L44 12L48 8L52 12Z" fill={`url(#${sparkGradientId})`}>
          <animateTransform attributeName="transform" type="rotate" values="0 48 12;360 48 12" dur="3s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite"/>
        </path>
        
        <path d="M20 52L16 56L12 52L16 48L20 52Z" fill={`url(#${sparkGradientId})`}>
          <animateTransform attributeName="transform" type="rotate" values="360 16 52;0 16 52" dur="2.5s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite"/>
        </path>
        
        <circle cx="28" cy="24" r="3" fill={`url(#${wandGradientId})`}>
          <animate attributeName="r" values="2;4;2" dur="1.8s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.4;1;0.4" dur="1.8s" repeatCount="indefinite"/>
        </circle>
        
        <circle cx="40" cy="36" r="2" fill={`url(#${sparkGradientId})`}>
          <animate attributeName="r" values="1;3;1" dur="2.2s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.5;1;0.5" dur="2.2s" repeatCount="indefinite"/>
        </circle>
      </g>
    </svg>
  );
};

// Animated Gear Icon
export const AnimatedGear: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => {
  const gearGradientId = generateId('gearGradient');
  
  return (
    <svg viewBox="0 0 64 64" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={gearGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor: "#10b981", stopOpacity: 1}} />
          <stop offset="100%" style={{stopColor: "#059669", stopOpacity: 1}} />
        </linearGradient>
      </defs>
    
      <g transform="translate(32,32)">
        <animateTransform attributeName="transform" type="rotate" values="0 0 0;360 0 0" dur="4s" repeatCount="indefinite"/>
        
        {/* Gear teeth */}
        <path d="M-4,-20 L4,-20 L6,-16 L-6,-16 Z" fill={`url(#${gearGradientId})`}/>
        <path d="M20,-4 L20,4 L16,6 L16,-6 Z" fill={`url(#${gearGradientId})`}/>
        <path d="M4,20 L-4,20 L-6,16 L6,16 Z" fill={`url(#${gearGradientId})`}/>
        <path d="M-20,4 L-20,-4 L-16,-6 L-16,6 Z" fill={`url(#${gearGradientId})`}/>
        
        {/* Main gear body */}
        <circle cx="0" cy="0" r="16" fill={`url(#${gearGradientId})`} fillOpacity="0.8"/>
        
        {/* Center hole */}
        <circle cx="0" cy="0" r="6" fill="white" fillOpacity="0.3"/>
      </g>
    </svg>
  );
};

// Animated Palette Icon
export const AnimatedPalette: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => {
  const paletteGradientId = generateId('paletteGradient');
  
  return (
    <svg viewBox="0 0 64 64" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={paletteGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor: "#8b5cf6", stopOpacity: 1}} />
          <stop offset="100%" style={{stopColor: "#ec4899", stopOpacity: 1}} />
        </linearGradient>
      </defs>
      
      {/* Palette base */}
      <path d="M32 8C44 8 54 18 54 30C54 42 44 52 32 52C28 52 26 50 26 46C26 44 28 42 30 42C34 42 38 38 38 34C38 30 34 26 30 26C18 26 8 36 8 48C8 52 12 56 16 56C20 56 24 52 24 48" 
            fill={`url(#${paletteGradientId})`} fillOpacity="0.8" stroke={`url(#${paletteGradientId})`} strokeWidth="2"/>
      
      {/* Animated color dots */}
      <circle cx="20" cy="32" r="3" fill="#ef4444">
        <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" begin="0s"/>
      </circle>
      <circle cx="32" cy="20" r="3" fill="#f59e0b">
        <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" begin="0.5s"/>
      </circle>
      <circle cx="44" cy="28" r="3" fill="#10b981">
        <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" begin="1s"/>
      </circle>
      <circle cx="36" cy="40" r="3" fill="#3b82f6">
        <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" begin="1.5s"/>
      </circle>
    </svg>
  );
};

// Animated Lightning Icon
export const AnimatedLightning: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => {
  const lightningGradientId = generateId('lightningGradient');
  
  return (
    <svg viewBox="0 0 64 64" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={lightningGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor: "#fbbf24", stopOpacity: 1}} />
          <stop offset="100%" style={{stopColor: "#f59e0b", stopOpacity: 1}} />
        </linearGradient>
      </defs>
      
      <path d="M24 8L40 32L32 32L40 56L24 32L32 32L24 8Z" fill={`url(#${lightningGradientId})`}>
        <animate attributeName="opacity" values="0.3;1;0.3" dur="0.8s" repeatCount="indefinite"/>
        <animateTransform attributeName="transform" type="scale" values="0.8;1.1;0.8" dur="0.8s" repeatCount="indefinite"/>
      </path>
      
      {/* Electric sparks */}
      <circle cx="20" cy="20" r="2" fill="#fbbf24">
        <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" begin="0s"/>
      </circle>
      <circle cx="44" cy="44" r="1.5" fill="#f59e0b">
        <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" begin="0.3s"/>
      </circle>
      <circle cx="48" cy="20" r="1" fill="#fbbf24">
        <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" begin="0.6s"/>
      </circle>
    </svg>
  );
};

// Animated Package Icon
export const AnimatedPackage: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => {
  const packageGradientId = generateId('packageGradient');
  
  return (
    <svg viewBox="0 0 64 64" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={packageGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor: "#6366f1", stopOpacity: 1}} />
          <stop offset="100%" style={{stopColor: "#3b82f6", stopOpacity: 1}} />
        </linearGradient>
      </defs>
      
      <g>
        <animateTransform attributeName="transform" type="translateY" values="0;-2;0" dur="2s" repeatCount="indefinite"/>
        
        {/* Package base */}
        <path d="M16 24L32 16L48 24L48 48L32 56L16 48Z" fill={`url(#${packageGradientId})`} fillOpacity="0.8"/>
        
        {/* Package top */}
        <path d="M16 24L32 16L48 24L32 32L16 24Z" fill={`url(#${packageGradientId})`}/>
        
        {/* Package side */}
        <path d="M32 32L48 24L48 48L32 56Z" fill={`url(#${packageGradientId})`} fillOpacity="0.6"/>
        
        {/* Ribbon */}
        <line x1="32" y1="16" x2="32" y2="56" stroke="#fbbf24" strokeWidth="3">
          <animate attributeName="stroke-dasharray" values="0,100;40,60;0,100" dur="3s" repeatCount="indefinite"/>
        </line>
        <line x1="16" y1="24" x2="48" y2="24" stroke="#fbbf24" strokeWidth="3">
          <animate attributeName="stroke-dasharray" values="0,100;32,68;0,100" dur="3s" repeatCount="indefinite" begin="0.5s"/>
        </line>
      </g>
    </svg>
  );
};

// Animated Search Icon
export const AnimatedSearch: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => {
  const searchGradientId = generateId('searchGradient');
  
  return (
    <svg viewBox="0 0 64 64" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={searchGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor: "#06b6d4", stopOpacity: 1}} />
          <stop offset="100%" style={{stopColor: "#0891b2", stopOpacity: 1}} />
        </linearGradient>
      </defs>
      
      {/* Magnifying glass */}
      <circle cx="28" cy="28" r="16" fill="none" stroke={`url(#${searchGradientId})`} strokeWidth="4">
        <animate attributeName="stroke-dasharray" values="0,100;50,50;100,0" dur="2s" repeatCount="indefinite"/>
      </circle>
      
      {/* Handle */}
      <line x1="40" y1="40" x2="52" y2="52" stroke={`url(#${searchGradientId})`} strokeWidth="4" strokeLinecap="round">
        <animateTransform attributeName="transform" type="rotate" values="0 46 46;15 46 46;0 46 46" dur="1.5s" repeatCount="indefinite"/>
      </line>
      
      {/* Search rays */}
      <g opacity="0.6">
        <line x1="28" y1="8" x2="28" y2="12" stroke={`url(#${searchGradientId})`} strokeWidth="2">
          <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" begin="0s"/>
        </line>
        <line x1="48" y1="28" x2="52" y2="28" stroke={`url(#${searchGradientId})`} strokeWidth="2">
          <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" begin="0.5s"/>
        </line>
        <line x1="28" y1="44" x2="28" y2="48" stroke={`url(#${searchGradientId})`} strokeWidth="2">
          <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" begin="1s"/>
        </line>
        <line x1="8" y1="28" x2="12" y2="28" stroke={`url(#${searchGradientId})`} strokeWidth="2">
          <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" begin="1.5s"/>
        </line>
      </g>
    </svg>
  );
};
