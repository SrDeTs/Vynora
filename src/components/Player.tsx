import React, { useState, useRef, useEffect } from 'react';
import { Song } from '../types/Song';

interface PlayerProps {
  selectedSong: Song;
  isPlayingProp?: boolean;
  onPlayingChange?: (isPlaying: boolean) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  playbackSpeed?: number;
  bassBoost?: boolean;
  volume?: number;
}

export function Player({ 
  selectedSong, 
  isPlayingProp = false, 
  onPlayingChange, 
  onNext, 
  onPrevious,
  playbackSpeed = 1,
  bassBoost = false,
  volume = 1
}: PlayerProps) {
  const [isPlaying, setIsPlaying] = useState(isPlayingProp);
  const audioRef1 = useRef<HTMLAudioElement>(null);
  const audioRef2 = useRef<HTMLAudioElement>(null);
  const [activeRef, setActiveRef] = useState<1 | 2>(1);
  const fadeInterval = useRef<any>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const filters = useRef<{ f1: BiquadFilterNode | null, f2: BiquadFilterNode | null }>({ f1: null, f2: null });

  // Sync internal state with prop
  useEffect(() => {
    setIsPlaying(isPlayingProp);
  }, [isPlayingProp]);

  // Handle speed
  useEffect(() => {
    if (audioRef1.current) audioRef1.current.playbackRate = playbackSpeed;
    if (audioRef2.current) audioRef2.current.playbackRate = playbackSpeed;
  }, [playbackSpeed]);

  // Handle Volume
  useEffect(() => {
    if (audioRef1.current && activeRef === 1) audioRef1.current.volume = volume;
    if (audioRef2.current && activeRef === 2) audioRef2.current.volume = volume;
  }, [volume, activeRef]);

  // Handle Bass Boost
  useEffect(() => {
    if (!bassBoost) {
      if (filters.current.f1) filters.current.f1.gain.value = 0;
      if (filters.current.f2) filters.current.f2.gain.value = 0;
      return;
    }

    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    if (audioContext.current.state === 'suspended') {
      audioContext.current.resume();
    }

    const setupFilter = (audio: HTMLAudioElement, key: 'f1' | 'f2') => {
      if (!filters.current[key] && audioContext.current) {
        const source = audioContext.current.createMediaElementSource(audio);
        const filter = audioContext.current.createBiquadFilter();
        filter.type = 'lowshelf';
        filter.frequency.value = 200;
        filter.gain.value = 10; // 10dB boost
        source.connect(filter);
        filter.connect(audioContext.current.destination);
        filters.current[key] = filter;
      } else if (filters.current[key]) {
        filters.current[key]!.gain.value = 10;
      }
    };

    if (audioRef1.current) setupFilter(audioRef1.current, 'f1');
    if (audioRef2.current) setupFilter(audioRef2.current, 'f2');

  }, [bassBoost]);

  // Handle play/pause via state
  useEffect(() => {
    const currentAudio = activeRef === 1 ? audioRef1.current : audioRef2.current;
    if (currentAudio) {
      if (isPlaying) {
        currentAudio.play().catch(console.error);
        if (audioContext.current?.state === 'suspended') audioContext.current.resume();
      } else {
        currentAudio.pause();
      }
    }
  }, [isPlaying, activeRef]);

  // Crossfade logic
  useEffect(() => {
    if (!selectedSong.localPath) return;

    const nextRef = activeRef === 1 ? audioRef2 : audioRef1;
    const currentRef = activeRef === 1 ? audioRef1 : audioRef2;
    
    // Check if it's already a URL (HTTP or FILE)
    const isUrl = selectedSong.localPath.startsWith('http') || selectedSong.localPath.startsWith('file://');
    const url = isUrl ? selectedSong.localPath : `file://${selectedSong.localPath}`;

    if (nextRef.current && currentRef.current) {
      // Clear any existing fade
      if (fadeInterval.current) clearInterval(fadeInterval.current);

      // Prepare next track
      nextRef.current.src = url;
      nextRef.current.volume = 0;
      nextRef.current.load();

      if (isPlaying) {
        nextRef.current.play().catch(console.error);
        
        // Crossfade duration: 1500ms
        const steps = 30;
        const interval = 50;
        let currentStep = 0;

        fadeInterval.current = setInterval(() => {
          currentStep++;
          const progress = currentStep / steps;
          
          if (currentRef.current) {
            currentRef.current.volume = Math.max(0, (1 - progress) * volume);
          }
          if (nextRef.current) {
            nextRef.current.volume = Math.min(1, progress * volume);
          }

          if (currentStep >= steps) {
            clearInterval(fadeInterval.current);
            if (currentRef.current) {
              currentRef.current.pause();
              currentRef.current.src = '';
            }
            setActiveRef(activeRef === 1 ? 2 : 1);
          }
        }, interval);
      } else {
        // Just switch if not playing
        currentRef.current.pause();
        currentRef.current.src = '';
        nextRef.current.volume = volume;
        setActiveRef(activeRef === 1 ? 2 : 1);
      }
    }
  }, [selectedSong]);

  const fadeVolume = (audio: HTMLAudioElement, target: number, duration: number, callback?: () => void) => {
    const startVolume = audio.volume;
    const startTime = performance.now();
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      audio.volume = (startVolume + (target - startVolume) * progress) * (target === 0 ? 1 : volume);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        if (callback) callback();
      }
    };
    
    requestAnimationFrame(animate);
  };

  const handleTogglePlay = () => {
    const currentAudio = activeRef === 1 ? audioRef1.current : audioRef2.current;
    if (currentAudio) {
      if (isPlaying) {
        // Fade out then pause
        fadeVolume(currentAudio, 0, 400, () => {
          currentAudio.pause();
          setIsPlaying(false);
          onPlayingChange?.(false);
        });
      } else {
        // Start from 0, play, then fade in
        currentAudio.volume = 0;
        currentAudio.play().catch(console.error);
        setIsPlaying(true);
        onPlayingChange?.(true);
        fadeVolume(currentAudio, 1, 400);
      }
    }
  };

  return (
    <>
      <audio 
        ref={audioRef1}
        onEnded={onNext}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      <audio 
        ref={audioRef2}
        onEnded={onNext}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      
      {/* Background Decoration */}
      <div
        className="fixed inset-0 pointer-events-none opacity-40 blur-[100px]"
        style={{
          zIndex: -5,
          backgroundImage: selectedSong.albumCover ? `url(${selectedSong.albumCover})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transition: 'all 2s ease-in-out'
        }}
      />

      {/* iOS-style Music Controls */}
      <div className="flex flex-col items-center gap-6 relative" style={{ zIndex: 100 }}>
        <div className="flex items-center gap-8">
          {/* Previous Button */}
          <button
            onClick={onPrevious}
            className="group relative flex items-center justify-center w-12 h-12 
                       text-white/80 hover:text-white transition-all duration-200 
                       transform hover:scale-110 active:scale-95"
          >
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
            </svg>
          </button>

          {/* Play/Pause Button */}
          <button
            onClick={handleTogglePlay}
            className="group relative flex items-center justify-center w-20 h-20 
                       bg-white rounded-full shadow-2xl hover:shadow-3xl 
                       transition-all duration-300 transform hover:scale-105 active:scale-95"
            style={{
              boxShadow: `
                0 12px 40px rgba(255,255,255,0.3),
                0 4px 16px rgba(0,0,0,0.1),
                inset 0 1px 3px rgba(255,255,255,0.2)
              `
            }}
          >
            {!isPlaying ? (
              <svg className="w-8 h-8 text-black ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            ) : (
              <svg className="w-8 h-8 text-black" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
              </svg>
            )}
          </button>

          {/* Next Button */}
          <button
            onClick={onNext}
            className="group relative flex items-center justify-center w-12 h-12 
                       text-white/80 hover:text-white transition-all duration-200 
                       transform hover:scale-110 active:scale-95"
          >
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
            </svg>
          </button>
        </div>

        <p className="text-sm text-gray-400 font-light tracking-wide">
          {isPlaying ? 'Tocando Agora' : 'Pausado'}
        </p>
      </div>
    </>
  );
}