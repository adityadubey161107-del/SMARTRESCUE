import React from 'react';
import { AlertCircle } from 'lucide-react';

export const EmergencyButton = ({ onClick, text = "🚨 REQUEST AMBULANCE", size = "large" }) => {
  return (
    <button
      onClick={onClick}
      className={`
        emergency-pulse-btn
        w-full flex items-center justify-center gap-3
        bg-emergency-600 hover:bg-emergency-700 active:bg-emergency-800 text-white font-extrabold tracking-wide uppercase rounded-2xl shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99]
        ${size === 'large' ? 'py-5 px-8 text-xl sm:text-2xl' : 'py-3.5 px-6 text-base'}
      `}
    >
      <AlertCircle className={size === 'large' ? 'w-8 h-8 animate-bounce' : 'w-5 h-5'} />
      <span>{text}</span>
    </button>
  );
};
