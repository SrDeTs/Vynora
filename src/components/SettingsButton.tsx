import React from 'react';
import { Settings } from 'lucide-react';

interface SettingsButtonProps {
  onClick: () => void;
}

export function SettingsButton({ onClick }: SettingsButtonProps) {
  return (
    <button
      onClick={onClick}
      className="group relative flex items-center justify-center w-12 h-12 
                 bg-zinc-900/60 backdrop-blur-2xl rounded-2xl 
                 border border-white/10 transition-all duration-500
                 hover:scale-110 active:scale-95 shadow-2xl overflow-hidden"
      title="Configurações"
      style={{ 
        zIndex: 1000,
        boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.1)'
      }}
    >
      {/* Animated Gradient Border Overlay */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000
                      bg-gradient-to-tr from-blue-500/20 via-transparent to-purple-500/20" />
      
      {/* Inner Glow */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      
      <Settings 
        size={22} 
        className="text-white/60 group-hover:text-white transition-all duration-1000 
                   group-hover:rotate-180 ease-out relative z-10" 
      />
      
      {/* Shine Effect */}
      <div className="absolute -left-[100%] top-0 w-full h-full bg-gradient-to-r 
                      from-transparent via-white/5 to-transparent skew-x-12
                      transition-all duration-1000 group-hover:left-[100%]" />
    </button>
  );
}
