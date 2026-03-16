import React from 'react';
import { motion } from 'framer-motion';
import { Server, Globe, CheckCircle2, Key } from 'lucide-react';

interface JellyfinTabProps {
  isScanning: boolean;
  jfUrl: string;
  setJfUrl: (url: string) => void;
  jfUser: string;
  setJfUser: (user: string) => void;
  jfPass: string;
  setJfPass: (pass: string) => void;
  onConnect: () => void;
  libraries: any[];
  onImportLibrary: (id: string) => void;
}

export function JellyfinTab({
  isScanning,
  jfUrl,
  setJfUrl,
  jfUser,
  setJfUser,
  jfPass,
  setJfPass,
  onConnect,
  libraries,
  onImportLibrary
}: JellyfinTabProps) {
  return (
    <motion.div 
      key="jellyfin"
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="space-y-6 h-full vynora-scrollbar overflow-y-auto pr-2"
    >
      <div className="p-6 bg-white/5 rounded-2xl border border-white/10 group hover:border-purple-500/30 transition-colors">
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <Server size={20} className="text-purple-400" />
          Sincronização Jellyfin
        </h3>
        
        <div className="space-y-4">
          <div className="relative">
            <Globe className="absolute left-3 top-3.5 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="URL do Servidor (ex: http://servidor:8096)"
              value={jfUrl}
              onChange={(e) => setJfUrl(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-gray-600 focus:border-purple-500 transition-colors outline-none"
            />
          </div>
          <div className="relative">
            <CheckCircle2 className="absolute left-3 top-3.5 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Nome de Usuário"
              value={jfUser}
              onChange={(e) => setJfUser(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-gray-600 focus:border-purple-500 transition-colors outline-none"
            />
          </div>
          <div className="relative">
            <Key className="absolute left-3 top-3.5 text-gray-400" size={18} />
            <input 
              type="password" 
              placeholder="Senha do Jellyfin"
              value={jfPass}
              onChange={(e) => setJfPass(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-gray-600 focus:border-purple-500 transition-colors outline-none"
            />
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onConnect}
            disabled={isScanning || !jfUrl || !jfUser || !jfPass}
            className="w-full py-4 bg-purple-600 text-white rounded-xl font-bold 
                       hover:bg-purple-500 transition-all disabled:opacity-50"
          >
            {isScanning ? 'Conectando...' : 'Conectar ao Jellyfin'}
          </motion.button>
        </div>
      </div>

      {libraries.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-2">Bibliotecas Disponíveis</p>
          {libraries.map((lib) => (
            <motion.button
              key={lib.Id}
              whileHover={{ scale: 1.01, x: 4 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onImportLibrary(lib.Id)}
              className="w-full p-4 bg-white/5 border border-white/5 hover:border-purple-500/50 hover:bg-white/10 rounded-2xl flex items-center justify-between transition-all group"
            >
              <span className="text-white font-medium group-hover:text-purple-300 transition-colors">{lib.Name}</span>
              <div className="text-xs text-purple-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Importar</div>
            </motion.button>
          ))}
        </div>
      )}
    </motion.div>
  );
}
