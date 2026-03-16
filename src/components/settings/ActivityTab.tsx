import React from 'react';
import { motion } from 'framer-motion';

interface ActivityTabProps {
  onClearCache: () => void;
  thermometerColors: string[];
}

export function ActivityTab({
  onClearCache,
  thermometerColors
}: ActivityTabProps) {
  const logs = (window as any).logs || [];

  return (
    <motion.div 
      key="logs"
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="space-y-6 h-full vynora-scrollbar overflow-y-auto pr-2"
    >
      <div className="flex flex-col gap-4 mb-4">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Manutenção e Cache</p>
        <div className="flex gap-4">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              onClearCache?.();
              alert('Cache de imagens foi limpo com sucesso!');
            }}
            className="flex-1 py-1 px-3 text-[10px] font-bold text-white bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all uppercase tracking-wider"
          >
            Limpar Capas
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              console.log("--- VYNORA DEBUG ---");
              console.log("Versão: 1.0.0");
              console.log("Color:", thermometerColors);
              alert('Depuração manual ativada. Verifique o console ou os registros abaixo.');
            }}
            className="flex-1 py-2 text-[10px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-all uppercase tracking-wider"
          >
            Depurar
          </motion.button>
        </div>
      </div>

      <div className="flex justify-between items-center mb-2">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Registros de Sistema</p>
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            const text = logs.map((l: any) => `[${l.timestamp}] ${l.type.toUpperCase()}: ${l.message}`).join('\n');
            navigator.clipboard.writeText(text || 'Vazio');
            alert('Logs copiados para a área de transferência!');
          }}
          className="text-[10px] font-bold text-blue-400 hover:text-blue-300 uppercase tracking-widest px-2 py-1 bg-blue-500/10 rounded-md transition-all"
        >
          Copiar
        </motion.button>
      </div>
      <div className="bg-black/40 border border-white/5 rounded-2xl p-4 font-mono text-[10px] h-[250px] overflow-y-auto space-y-1 vynora-scrollbar shadow-inner">
        {logs.length === 0 ? (
          <div className="text-gray-600 italic">Aguardando novos eventos...</div>
        ) : (
          logs.map((log: any, i: number) => (
            <div key={i} className={log.type === 'error' ? 'text-red-400' : log.type === 'warn' ? 'text-yellow-400' : 'text-gray-500'}>
              <span className="opacity-40">[{log.timestamp}]</span> <span className="font-bold">{log.type.toUpperCase()}:</span> {log.message}
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}
