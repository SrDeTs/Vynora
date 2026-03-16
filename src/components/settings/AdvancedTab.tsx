import React from 'react';
import { motion } from 'framer-motion';

interface AdvancedTabProps {
  playbackSpeed: number;
  onSpeedChange: (speed: number) => void;
  bassBoost: boolean;
  onBassChange: (bass: boolean) => void;
}

export function AdvancedTab({
  playbackSpeed,
  onSpeedChange,
  bassBoost,
  onBassChange
}: AdvancedTabProps) {
  return (
    <motion.div 
      key="advanced"
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="space-y-8 h-full vynora-scrollbar overflow-y-auto pr-2"
    >
      {/* Playback Speed */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Velocidade de Reprodução</p>
          <span className="text-sm font-bold text-blue-400">{playbackSpeed}x</span>
        </div>
        <input 
          type="range" 
          min="0.5" 
          max="2.0" 
          step="0.1" 
          value={playbackSpeed}
          onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
          className="w-full vynora-slider select-none"
          style={{
            background: `linear-gradient(to right, #3b82f6 ${((playbackSpeed - 0.5) / (2.0 - 0.5)) * 100}%, rgba(255, 255, 255, 0.1) ${((playbackSpeed - 0.5) / (2.0 - 0.5)) * 100}%)`
          }}
        />
        <div className="flex justify-between text-[10px] text-gray-500 px-1">
          <span>Lento</span>
          <span>Normal</span>
          <span>Rápido</span>
        </div>
      </div>

      {/* Audio Effects */}
      <div className="space-y-4">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Processamento de Áudio</p>
        <div className="flex items-center justify-between p-5 bg-white/5 rounded-[24px] border border-white/5 transition-all group">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">Bass Boost (Reforço)</span>
            <span className="text-[10px] text-gray-500">Destaca as frequências graves do som</span>
          </div>
          <label className="vynora-switch">
            <input 
              type="checkbox" 
              checked={bassBoost}
              onChange={(e) => onBassChange(e.target.checked)}
            />
            <span className="vynora-switch-slider"></span>
          </label>
        </div>
      </div>
    </motion.div>
  );
}
