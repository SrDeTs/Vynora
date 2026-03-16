import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ElectricBorderAnimationProps {
  children: React.ReactNode;
  isActive?: boolean;
  isEnabled?: boolean;
  intensity?: number;
  color?: string;
}

/**
 * CAVA Wavy Border Animation - FINAL THICKNESS EDITION
 * Thick white line (~10px) with smooth, rounded "humps" (spikes) 
 * that reacts to music and fades out when paused.
 */
export function ElectricBorderAnimation({ 
  children, 
  isActive = true, 
  isEnabled = true,
  intensity = 1,
  color = '#ffffff'
}: ElectricBorderAnimationProps) {
  const filterId = useMemo(() => `cava-wavy-final-${Math.random().toString(36).substr(2, 9)}`, []);

  // Use the color prop if provided, but default to white as per reference
  const themeColor = color || '#ffffff';

  if (!isEnabled) {
    return <>{children}</>;
  }

  // Displacement scale for humps (peaks)
  // Higher intensity = larger "jumps"
  const waveScale = 60 * intensity;
  
  return (
    <div className="relative w-full h-full p-[12px] rounded-[36px] overflow-visible group">
      {/* SVG Filters for "Smooth Thick Waves" */}
      <svg className="absolute inset-0 w-0 h-0 pointer-events-none">
        <defs>
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            {/* 
              Fractal Noise with low frequency for smooth, bulky "humps".
            */}
            <feTurbulence 
              type="fractalNoise" 
              baseFrequency="0.01 0.03" 
              numOctaves="1" 
              result="wavyNoise" 
              seed="777"
            >
              <animate 
                attributeName="seed" 
                from="777" 
                to="5777" 
                dur="12s" 
                repeatCount="indefinite" 
              />
            </feTurbulence>
            
            <feDisplacementMap 
              in="SourceGraphic" 
              in2="wavyNoise" 
              scale={waveScale} 
              xChannelSelector="R" 
              yChannelSelector="G" 
            />
            
            {/* Softening for the thick line look */}
            <feGaussianBlur stdDeviation="1.5" />
          </filter>
        </defs>
      </svg>

      {/* The Animated Border Container */}
      <motion.div 
        className="absolute inset-0 pointer-events-none" 
        style={{ zIndex: 20 }}
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: isActive ? 1 : 0,
          scale: isActive ? 1.01 : 1
        }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        {/* Extreme Outer Glow (The Heavy Aura indicated by arrows) */}
        <div 
          className="absolute inset-[0px] border-[14px] rounded-[34px] blur-[30px]"
          style={{ borderColor: themeColor, opacity: 0.7 * intensity }}
        />

        {/* The CAVA Line - Ultra Thick White Main Stroke (~10px) */}
        <div 
          className="absolute inset-[0px] border-[10px] rounded-[24px]"
          style={{ 
            borderColor: themeColor,
            filter: `url(#${filterId})`,
            boxShadow: `0 0 30px ${themeColor}80`,
          }}
        />

        {/* Core Intensity Burst - Intense inner core shine */}
        <div 
          className="absolute inset-[2px] border-[4px] rounded-[24px] blur-[2px]"
          style={{ 
            borderColor: '#ffffff',
            filter: `url(#${filterId})`,
            opacity: 0.9 * intensity
          }}
        />
      </motion.div>

      {/* App Content Layer - Solid Glass Base */}
      <div className="relative z-10 w-full h-full bg-zinc-950/40 backdrop-blur-xl rounded-[24px] overflow-hidden border border-white/10">
        {children}
      </div>

      {/* Surface Ambient Glow */}
      <AnimatePresence>
        {isActive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 * intensity }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none rounded-[36px] mix-blend-screen"
            style={{ 
              background: `radial-gradient(circle at center, ${themeColor}40 0%, transparent 95%)` 
            }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
