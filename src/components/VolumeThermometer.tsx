import React, { useState, useRef, useEffect, useCallback } from 'react';
import { gsap } from 'gsap';

interface VolumeThermometerProps {
  volume: number;
  onVolumeChange: (vol: number) => void;
  customColors?: string[];
}

const CONFIG = {
  minVol: 0,
  maxVol: 100,
  gradientColors: ["#00eaff", "#0099ff", "#00ff73", "#ffdd00", "#ff8800", "#ff0044"],
  gradientStops: [0, 0.25, 0.5, 0.7, 0.85, 1],
};

// Linear interpolation helper
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Color mapping function
const getColorForVolume = (t: number, customColor?: string) => {
  if (customColor && customColor.trim() !== '') return customColor;
  
  const { gradientColors, gradientStops } = CONFIG;
  const colors = gradientColors.map(c => gsap.utils.splitColor(c) as [number, number, number]);
  t = Math.max(0, Math.min(1, t));

  for (let i = 0; i < gradientStops.length - 1; i++) {
    const s0 = gradientStops[i];
    const s1 = gradientStops[i + 1];
    if (t >= s0 && t <= s1) {
      const n = (t - s0) / (s1 - s0);
      const c0 = colors[i];
      const c1 = colors[i + 1];
      const r = Math.round(lerp(c0[0], c1[0], n));
      const g = Math.round(lerp(c0[1], c1[1], n));
      const b = Math.round(lerp(c0[2], c1[2], n));
      return `rgb(${r}, ${g}, ${b})`;
    }
  }
  return gradientColors[gradientColors.length - 1];
};


export const VolumeThermometer: React.FC<VolumeThermometerProps> = ({ 
  volume, 
  onVolumeChange,
  customColors = [] 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [displayVolume, setDisplayVolume] = useState(Math.round(volume * 100));
  const trackRef = useRef<HTMLDivElement>(null);
  const mercuryRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const scaleContainerRef = useRef<HTMLDivElement>(null);

  const currentColor = getColorForVolume(volume);
  const isCustom = customColors.length > 0;

  // Sync visuals when volume prop changes
  useEffect(() => {
    if (!isDragging) {
      const vol = Math.round(volume * 100);
      setDisplayVolume(vol);

      if (trackRef.current && knobRef.current && mercuryRef.current) {
        const height = trackRef.current.offsetHeight;
        const targetY = height * (1 - volume);
        
        gsap.to(knobRef.current, { 
          y: targetY, 
          yPercent: -50,
          xPercent: -50,
          duration: 0.25, 
          ease: "back.out(1.2)" 
        });
        gsap.to(mercuryRef.current, { height: `${volume * 100}%`, duration: 0.25, ease: "power2.out" });
        updateScaleEffects(targetY);
      }
    }
  }, [volume, isDragging]);

  const updateScaleEffects = useCallback((knobY: number) => {
    if (!scaleContainerRef.current) return;
    const marks = scaleContainerRef.current.children;
    const maxDist = 80;

    Array.from(marks).forEach((mark) => {
      const el = mark as HTMLElement;
      const elY = el.offsetTop;
      const dist = Math.abs(knobY - elY);

      if (dist < maxDist) {
        const p = 1 - dist / maxDist;
        gsap.to(el, {
          scale: 1 + p * 0.5,
          opacity: 0.3 + p * 0.7,
          color: "#fff",
          duration: 0.1,
          overwrite: true
        });
      } else {
        gsap.to(el, {
          scale: 1,
          opacity: 0.3,
          color: "rgba(255,255,255,0.5)",
          duration: 0.2,
          overwrite: true
        });
      }
    });
  }, []);

  const handleInteraction = useCallback((clientY: number) => {
    if (!trackRef.current || !knobRef.current || !mercuryRef.current) return;

    const rect = trackRef.current.getBoundingClientRect();
    const trackHeight = rect.height;

    let newValue = 1 - (clientY - rect.top) / trackHeight;
    newValue = Math.max(0, Math.min(1, newValue));

    const roundedVol = Math.round(newValue * 100);
    setDisplayVolume(roundedVol);
    onVolumeChange(newValue);

    const targetY = trackHeight * (1 - newValue);
    gsap.set(knobRef.current, { 
      y: targetY,
      yPercent: -50,
      xPercent: -50
    });
    gsap.set(mercuryRef.current, { height: `${newValue * 100}%` });
    updateScaleEffects(targetY);
  }, [onVolumeChange, updateScaleEffects]);

  const onPointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    handleInteraction(e.clientY);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (isDragging) {
      handleInteraction(e.clientY);
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
  };

  const renderScale = () => {
    const marks = [];
    for (let i = 0; i <= 100; i += 10) {
      marks.push(
        <div
          key={i}
          className="v-scale-mark"
          style={{ top: `${100 - i}%`, transform: 'translateY(-50%)' }}
        >
          <span>{i}</span>
          <div className="v-tick"></div>
        </div>
      );
    }
    return marks;
  };

  return (
    <div
      className="fixed bottom-12 right-12 z-[2147483647] pointer-events-auto select-none touch-none"
      style={{ '--glow-color': currentColor } as React.CSSProperties}
    >
      <div className="thermostat-ui scale-90 md:scale-100 animate-fade-in origin-right flex flex-col items-center gap-6">
        {/* Thermometer Section */}
        <div className="relative order-1">
          <div ref={scaleContainerRef} className="v-scale-container">
            {renderScale()}
          </div>

          <div className="thermostat glass-panel">
            <div className="thermostat-inner relative">
              <div className="glass-noise"></div>

              {/* Interaction Track */}
                <div
                  ref={trackRef}
                  className="v-track relative z-10 cursor-pointer"
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                >
                  {/* Expanded hit area for better interaction */}
                  <div className="absolute inset-x-[-40px] inset-y-0 z-0" />
                  
                  {/* Mercury + Bubbles Container */}
                  <div className="absolute inset-0 z-1 pointer-events-none">
                    <div
                      className="v-mercury"
                      ref={mercuryRef}
                      style={{ 
                        width: '100%', 
                        left: 0,
                        background: isCustom 
                          ? `linear-gradient(180deg, 
                              ${customColors[0]} 0%, 
                              ${customColors[1] || customColors[0]} 35%, 
                              ${customColors[2] || customColors[1] || customColors[0]} 100%)`
                          : undefined,
                        backgroundSize: isCustom ? '100% 200%' : 'auto',
                        animation: isCustom ? 'HgMixing 6s ease-in-out infinite' : undefined,
                        boxShadow: isCustom ? `0 0 45px ${customColors[0]}66` : undefined
                      }}
                    >
                      {/* Premium Glass Highlight Overlay */}
                      <div className="v-mercury-highlight" />
                    </div>
                    
                    {/* Atmospheric Bubbles for Gooey boiling effect */}
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div 
                        key={i} 
                        className="v-mercury-bubble"
                        style={{ 
                          '--dur': `${3 + i * 0.7}s`,
                          '--offset': `${(i - 3) * 6}px`,
                          '--curr-height': `${volume * 100}%`,
                          left: `${15 + i * 14}%`,
                          backgroundColor: isCustom ? customColors[i % customColors.length] : undefined,
                          boxShadow: isCustom ? `0 0 15px ${customColors[i % customColors.length]}88` : undefined
                        } as any}
                      />
                    ))}
                  </div>
                </div>

                {/* Knob (The "Bulb" handle) */}
                <div 
                  ref={knobRef} 
                  className="v-knob absolute pointer-events-none z-20"
                  style={{ top: 0 }} // Positioned by GSAP
                >
                  {/* Subtle inner light for the knob */}
                  <div className="absolute inset-2 rounded-full bg-white/5 blur-sm" />
                  
                  {/* Visual lines on knob */}
                  <div className="w-full h-full flex items-center justify-center pointer-events-none relative z-10">
                    <div className="flex flex-col gap-1.5 opacity-60">
                        <div className="w-5 h-[2px] bg-white rounded-full" />
                        <div className="w-5 h-[2px] bg-white rounded-full" />
                        <div className="w-5 h-[2px] bg-white rounded-full" />
                    </div>
                  </div>
                </div>
            </div>
          </div>
        </div>

        {/* Readout Section at the bottom */}
        <div className="v-temp-readout order-2 mt-4">
          <div className="v-temp-value tabular-nums shadow-glow !text-[4rem]">
            {displayVolume}%
          </div>
        </div>
      </div>
    </div>
  );
};
