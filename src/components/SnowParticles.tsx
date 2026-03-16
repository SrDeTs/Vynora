import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface SnowParticlesProps {
  intensity: number; // 0 to 1
}

export const SnowParticles: React.FC<SnowParticlesProps> = ({ intensity }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalId = useRef<NodeJS.Timeout | null>(null);

  const createParticle = () => {
    if (!containerRef.current) return;

    const p = document.createElement('div');
    p.className = 'absolute pointer-events-none rounded-full';
    containerRef.current.appendChild(p);

    const size = Math.random() * 8 + 4;
    const baseOpacity = 0.6 + Math.random() * 0.4;
    const blurVal = Math.random() * 1.5 + 0.5;

    Object.assign(p.style, {
      width: `${size}px`,
      height: `${size}px`,
      background: `radial-gradient(circle, rgba(255,255,255,${baseOpacity}) 0%, transparent 100%)`,
      filter: `blur(${blurVal}px)`,
      boxShadow: '0 0 15px rgba(255,255,255,0.4)',
    });

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const startX = Math.random() * vw;
    const startY = -50 - Math.random() * 100;

    gsap.set(p, { x: startX, y: startY, opacity: 0, scale: 0.5 });

    const fallDuration = 5 + (1 - intensity) * 5; // Faster if higher intensity
    const swayX = 50 + Math.random() * 50;

    gsap.timeline({ onComplete: () => p.remove() })
      .to(p, { opacity: 1, scale: 1, duration: 0.5, ease: "power2.out" })
      .to(p, {
        y: vh + 100,
        x: `+=${Math.random() * swayX - swayX / 2}`,
        rotation: Math.random() * 180,
        opacity: 0,
        duration: fallDuration,
        ease: "none"
      }, 0)
      .to(p, {
        x: `+=${Math.random() * 30 - 15}`,
        yoyo: true,
        repeat: -1,
        duration: 2 + Math.random() * 2,
        ease: "sine.inOut"
      }, 0.2);
  };

  useEffect(() => {
    if (intervalId.current) clearInterval(intervalId.current);

    // Particles only show if intensity is significant (representing "cold/low volume" or vice versa if mapped differently)
    // Actually, let's map it so high volume = more plasma/heat, low volume = more snow/cold.
    // The user said "reacts to volume level". Let's say volume < 0.4 spawns snow.
    
    const snowThreshold = 0.4;
    if (intensity < snowThreshold) {
      const spawnRate = 200 + intensity * 800; // Faster spawn if volume is lower
      intervalId.current = setInterval(createParticle, spawnRate);
    } else {
      // Clear existing particles if above threshold
      if (containerRef.current) {
        // We could fade them out, but for now just stop spawning
      }
    }

    return () => {
      if (intervalId.current) clearInterval(intervalId.current);
    };
  }, [intensity]);

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden" 
      id="snow-particles"
    />
  );
};
