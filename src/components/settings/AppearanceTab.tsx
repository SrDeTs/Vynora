import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HexColorPicker } from "react-colorful";

interface AppearanceTabProps {
  theme: string;
  onThemeChange: (theme: string) => void;
  thermometerColors: string[];
  onThermometerColorsChange: (colors: string[]) => void;
  isDynamicMercury: boolean;
  onDynamicMercuryChange: (isDynamic: boolean) => void;
  showCustomPicker: number | null;
  setShowCustomPicker: (index: number | null) => void;
}

export function AppearanceTab({
  theme,
  onThemeChange,
  thermometerColors,
  onThermometerColorsChange,
  isDynamicMercury,
  onDynamicMercuryChange,
  showCustomPicker,
  setShowCustomPicker
}: AppearanceTabProps) {
  // Ultra-Premium Dynamic Palette: Deep Sapphire, Electric Cyan, Emerald, Chrome, Crimson
  const dynamicGradient = 'linear-gradient(90deg, #0f172a 0%, #06b6d4 25%, #10b981 50%, #94a3b8 75%, #e11d48 100%)';

  return (
    <motion.div 
      key="appearance"
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="h-full relative overflow-hidden"
    >
      <div className="space-y-6 h-full vynora-scrollbar overflow-y-auto pr-2 pb-40">

        {/* Theme Selector */}
        <div className="space-y-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Estilo Visual (Tema)</p>
          <div className="grid grid-cols-3 gap-6 p-1">
            {[
              { id: 'glass', name: 'Vidro', color: 'bg-zinc-800' },
              { id: 'midnight', name: 'Meia-Noite', color: 'bg-black' },
              { id: 'classic', name: 'Clássico', color: 'bg-slate-900' }
            ].map((t) => (
              <motion.button
                key={t.id}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onThemeChange(t.id)}
                className={`p-4 rounded-2xl border vynora-theme-card text-center transition-all overflow-hidden ${
                  theme === t.id ? 'active border-white bg-white/10' : 'border-white/5 bg-white/5'
                }`}
              >
                <div className={`w-full h-10 ${t.color} rounded-lg mb-3 border border-white/10`}></div>
                <span className="text-xs text-white uppercase font-bold tracking-tight">{t.name}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Thermometer Color Customization */}
        <div className="space-y-6 pt-4">
          <div className="flex justify-between items-center px-1">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Cor do Mercúrio (Mistura)</p>
            <motion.button 
              whileHover={!isDynamicMercury ? { scale: 1.05, x: -2 } : {}}
              whileTap={!isDynamicMercury ? { scale: 0.95 } : {}}
              onClick={() => onDynamicMercuryChange(true)}
              className={`text-[10px] uppercase font-bold tracking-widest transition-colors ${
                isDynamicMercury ? 'text-blue-400 cursor-default' : 'text-gray-500 hover:text-blue-400'
              }`}
            >
              {isDynamicMercury ? 'Modo Dinâmico Ativo' : 'Resetar para Dinâmico'}
            </motion.button>
          </div>
          
          <div className="flex items-center gap-4 p-1">
            <div className="flex gap-3">
              {thermometerColors.map((color, index) => (
                <div key={index} className="relative">
                  <button
                    onClick={() => {
                      onDynamicMercuryChange(false);
                      setShowCustomPicker(showCustomPicker === index ? null : index);
                    }}
                    className={`w-16 h-16 rounded-[24px] border-2 transition-all hover:scale-110 active:scale-95 flex items-center justify-center group ${
                      !isDynamicMercury && showCustomPicker === index 
                        ? 'border-white shadow-[0_0_20px_rgba(255,255,255,0.4)]' 
                        : 'border-white/10'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                </div>
              ))}
            </div>

            <div className="flex-1 h-16 rounded-[24px] border border-white/10 overflow-hidden relative group bg-black/40">
              <div 
                className="absolute inset-0 opacity-90 transition-all duration-500"
                style={{ 
                  background: isDynamicMercury 
                    ? dynamicGradient
                    : `linear-gradient(90deg, ${thermometerColors[0]} 0%, ${thermometerColors[1] || thermometerColors[0]} 50%, ${thermometerColors[2] || thermometerColors[1] || thermometerColors[0]} 100%)`
                }}
              >
                {/* Preview Glass Highlight */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-50" />
                <div className="absolute top-1 left-4 right-4 h-[20%] bg-white/20 rounded-full blur-[1px]" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[9px] font-black text-white uppercase tracking-[0.3em] drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                  {isDynamicMercury ? 'Dinâmico' : 'Customizado'}
                </span>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-gray-500 pl-1">
            Misture até 3 cores para criar um efeito único no termômetro.
          </p>
        </div>
      </div>

      {/* Centralized Color Picker Popover */}
      <AnimatePresence>
        {showCustomPicker !== null && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/20 backdrop-blur-[2px]">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 z-[60]" 
              onClick={() => setShowCustomPicker(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="relative z-[70] p-6 rounded-[40px] bg-zinc-900/90 backdrop-blur-3xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] w-full max-w-[290px]"
            >
              <div className="flex flex-col items-center">
                <HexColorPicker 
                  color={thermometerColors[showCustomPicker]} 
                  onChange={(newColor) => {
                    const newColors = [...thermometerColors];
                    newColors[showCustomPicker] = newColor;
                    onThermometerColorsChange(newColors);
                  }} 
                />
                <div className="mt-6 w-full flex items-center justify-between px-1">
                  <div className="flex flex-col">
                    <span className="text-[8px] uppercase text-white/30 font-black tracking-widest mb-0.5">HEX CODE</span>
                    <span className="text-xs font-mono text-white/80 uppercase tracking-wider">{thermometerColors[showCustomPicker]}</span>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.05, backgroundColor: 'white', color: 'black' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowCustomPicker(null)}
                    className="px-6 py-2.5 rounded-2xl bg-white/10 text-[10px] text-white font-black uppercase transition-all border border-white/10"
                  >
                    Concluir
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
