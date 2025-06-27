import React from 'react';

const Spinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="relative w-24 h-24">
        {/* Main magic creation animation */}
        <svg 
          width="96" 
          height="96" 
          viewBox="0 0 96 96" 
          className="absolute inset-0"
        >
          <defs>
            <linearGradient id="wandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor: '#6366f1', stopOpacity: 1}} />
              <stop offset="50%" style={{stopColor: '#8b5cf6', stopOpacity: 1}} />
              <stop offset="100%" style={{stopColor: '#ec4899', stopOpacity: 1}} />
            </linearGradient>
            <linearGradient id="creationGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor: '#f59e0b', stopOpacity: 1}} />
              <stop offset="100%" style={{stopColor: '#ef4444', stopOpacity: 1}} />
            </linearGradient>
            <radialGradient id="glowGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" style={{stopColor: '#ffffff', stopOpacity: 0.8}} />
              <stop offset="70%" style={{stopColor: '#8b5cf6', stopOpacity: 0.3}} />
              <stop offset="100%" style={{stopColor: '#6366f1', stopOpacity: 0}} />
            </radialGradient>
            
            {/* Animation filters */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/> 
              </feMerge>
            </filter>
          </defs>
          
          {/* Magical creation circle - expands and contracts */}
          <circle 
            cx="48" 
            cy="48" 
            r="35" 
            fill="none" 
            stroke="url(#wandGradient)" 
            strokeWidth="2"
            strokeDasharray="8 4"
            opacity="0.6"
            filter="url(#glow)"
          >
            <animateTransform 
              attributeName="transform" 
              type="rotate" 
              values="0 48 48;360 48 48" 
              dur="3s" 
              repeatCount="indefinite"
            />
            <animate 
              attributeName="r" 
              values="30;40;30" 
              dur="2s" 
              repeatCount="indefinite"
            />
            <animate 
              attributeName="opacity" 
              values="0.3;0.8;0.3" 
              dur="2s" 
              repeatCount="indefinite"
            />
          </circle>
          
          {/* Central magic wand */}
          <g transform="translate(48, 48)">
            <animateTransform 
              attributeName="transform" 
              type="rotate" 
              values="0 0 0;15 0 0;-15 0 0;0 0 0" 
              dur="1.5s" 
              repeatCount="indefinite"
            />
            
            {/* Wand handle */}
            <rect x="-2" y="8" width="4" height="16" rx="2" fill="#8b5cf6" opacity="0.9"/>
            
            {/* Wand tip */}
            <circle cx="0" cy="-12" r="3" fill="url(#wandGradient)" filter="url(#glow)"/>
            
            {/* Magic trail from wand tip */}
            <path 
              d="M0,-12 Q-8,-20 -15,-15 Q-10,-8 0,-12" 
              fill="none" 
              stroke="url(#creationGradient)" 
              strokeWidth="2" 
              opacity="0.7"
            >
              <animate 
                attributeName="opacity" 
                values="0;0.8;0" 
                dur="1s" 
                repeatCount="indefinite"
              />
            </path>
          </g>
          
          {/* Creating icons/elements around the wand */}
          <g>
            {/* Small icon being created - top right */}
            <rect x="68" y="20" width="8" height="8" rx="2" fill="url(#creationGradient)" opacity="0">
              <animate 
                attributeName="opacity" 
                values="0;1;0" 
                dur="2s" 
                repeatCount="indefinite"
                begin="0s"
              />
              <animateTransform 
                attributeName="transform" 
                type="scale" 
                values="0;1.2;1" 
                dur="2s" 
                repeatCount="indefinite"
                begin="0s"
              />
            </rect>
            
            {/* Small heart being created - left */}
            <path 
              d="M16,32 C16,28 20,24 24,28 C28,24 32,28 32,32 C32,36 24,44 24,44 C24,44 16,36 16,32 Z" 
              fill="url(#creationGradient)" 
              opacity="0"
              transform="scale(0.3) translate(24, 24)"
            >
              <animate 
                attributeName="opacity" 
                values="0;1;0" 
                dur="2s" 
                repeatCount="indefinite"
                begin="0.7s"
              />
              <animateTransform 
                attributeName="transform" 
                type="scale" 
                values="0;0.4;0.3" 
                dur="2s" 
                repeatCount="indefinite"
                begin="0.7s"
              />
            </path>
            
            {/* Small star being created - bottom */}
            <path 
              d="M24,8 L26,14 L32,14 L27,18 L29,24 L24,20 L19,24 L21,18 L16,14 L22,14 Z" 
              fill="url(#wandGradient)" 
              opacity="0"
              transform="translate(48, 72) scale(0.4)"
            >
              <animate 
                attributeName="opacity" 
                values="0;1;0" 
                dur="2s" 
                repeatCount="indefinite"
                begin="1.3s"
              />
              <animateTransform 
                attributeName="transform" 
                type="scale" 
                values="0;0.5;0.4" 
                dur="2s" 
                repeatCount="indefinite"
                begin="1.3s"
              />
            </path>
          </g>
          
          {/* Floating sparkles */}
          <g>
            <circle cx="72" cy="40" r="2" fill="#f59e0b" opacity="0">
              <animate attributeName="cy" values="40;35;40" dur="1.5s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0;0.8;0" dur="1.5s" repeatCount="indefinite"/>
            </circle>
            <circle cx="20" cy="60" r="1.5" fill="#ec4899" opacity="0">
              <animate attributeName="cy" values="60;55;60" dur="2s" repeatCount="indefinite" begin="0.5s"/>
              <animate attributeName="opacity" values="0;0.6;0" dur="2s" repeatCount="indefinite" begin="0.5s"/>
            </circle>
            <circle cx="75" cy="70" r="1" fill="#8b5cf6" opacity="0">
              <animate attributeName="cy" values="70;65;70" dur="1.8s" repeatCount="indefinite" begin="1s"/>
              <animate attributeName="opacity" values="0;0.9;0" dur="1.8s" repeatCount="indefinite" begin="1s"/>
            </circle>
          </g>
          
          {/* Magical energy waves */}
          <circle cx="48" cy="48" r="45" fill="none" stroke="url(#glowGradient)" strokeWidth="1" opacity="0">
            <animate attributeName="r" values="20;50;20" dur="3s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0;0.3;0" dur="3s" repeatCount="indefinite"/>
          </circle>
        </svg>
        
        {/* Pulsing glow effect behind everything */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 animate-pulse" 
             style={{ animationDuration: '2s' }}></div>
      </div>
    </div>
  );
};

export default Spinner;

