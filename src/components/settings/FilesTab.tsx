import React from 'react';
import { motion } from 'framer-motion';
import { Music, RotateCcw, FolderOpen, CheckCircle2 } from 'lucide-react';

interface FilesTabProps {
  isScanning: boolean;
  onSelectFolder: () => void;
  lastFolder: string | null;
  foundCount: number;
}

export function FilesTab({ isScanning, onSelectFolder, lastFolder, foundCount }: FilesTabProps) {
  return (
    <motion.div 
      key="local"
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="space-y-6 h-full vynora-scrollbar overflow-y-auto pr-2"
    >
      <div className="p-6 bg-white/5 rounded-2xl border border-white/10 group hover:border-blue-500/30 transition-colors">
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <Music size={20} className="text-blue-400" />
          Biblioteca Local
        </h3>
        <p className="text-sm text-gray-400 mb-6 font-light leading-relaxed">
          Escaneie músicas do seu computador. Suporta: .mp3, .m4a, .flac.
        </p>
        
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={onSelectFolder}
          disabled={isScanning}
          className="w-full py-4 px-4 bg-blue-600 text-white rounded-xl font-bold 
                     flex items-center justify-center gap-3 hover:bg-blue-500 
                     transition-all disabled:opacity-50 shadow-lg shadow-blue-900/20"
        >
          {isScanning ? <RotateCcw size={20} className="animate-spin" /> : <FolderOpen size={20} />}
          {isScanning ? 'Escaneando biblioteca...' : 'Selecionar Pasta'}
        </motion.button>
      </div>

      {lastFolder && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 flex items-start gap-4 shadow-inner"
        >
          <CheckCircle2 size={24} className="text-blue-500 mt-1" />
          <div className="min-w-0">
            <p className="text-sm text-blue-200 font-bold">Pasta Carregada</p>
            <p className="text-xs text-blue-400/70 truncate mt-0.5">{lastFolder}</p>
            <p className="text-xs text-blue-300 mt-2 bg-blue-500/20 px-2 py-0.5 rounded-full inline-block font-bold">
              {foundCount} músicas encontradas
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
