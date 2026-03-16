import React, { useState, useEffect } from 'react';
import { X, FolderOpen, Palette, Settings, Activity, Server, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { JellyfinService } from '../services/jellyfinService';

// Fragmented Components
import { FilesTab } from './settings/FilesTab';
import { JellyfinTab } from './settings/JellyfinTab';
import { AppearanceTab } from './settings/AppearanceTab';
import { AdvancedTab } from './settings/AdvancedTab';
import { ActivityTab } from './settings/ActivityTab';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFolderSelect: (songs: any[]) => void;
  theme: string;
  onThemeChange: (theme: string) => void;
  playbackSpeed: number;
  onSpeedChange: (speed: number) => void;
  bassBoost: boolean;
  onBassChange: (bass: boolean) => void;
  onClearCache?: () => void;
  thermometerColors: string[];
  onThermometerColorsChange: (colors: string[]) => void;
  isDynamicMercury: boolean;
  onDynamicMercuryChange: (isDynamic: boolean) => void;
}

export function SettingsModal({ 
  isOpen, 
  onClose, 
  onFolderSelect,
  theme,
  onThemeChange,
  playbackSpeed,
  onSpeedChange,
  bassBoost,
  onBassChange,
  onClearCache,
  thermometerColors,
  onThermometerColorsChange,
  isDynamicMercury,
  onDynamicMercuryChange
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'local' | 'jellyfin' | 'appearance' | 'advanced' | 'logs'>('local');
  const [showCustomPicker, setShowCustomPicker] = useState<number | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [lastFolder, setLastFolder] = useState<string | null>(null);
  const [foundCount, setFoundCount] = useState(0);

  // Jellyfin states
  const [jfUrl, setJfUrl] = useState(localStorage.getItem('jf_url') || '');
  const [jfUser, setJfUser] = useState(localStorage.getItem('jf_user') || '');
  const [jfPass, setJfPass] = useState(localStorage.getItem('jf_pass') || '');
  const [jfKey, setJfKey] = useState(localStorage.getItem('jf_key') || '');
  const [libraries, setLibraries] = useState<any[]>([]);

  useEffect(() => {
    localStorage.setItem('jf_url', jfUrl);
    localStorage.setItem('jf_user', jfUser);
    localStorage.setItem('jf_pass', jfPass);
    localStorage.setItem('jf_key', jfKey);
  }, [jfUrl, jfUser, jfPass, jfKey]);

  if (!isOpen) return null;

  const handleSelectFolder = async () => {
    try {
      const folder = await (window as any).ipcRenderer.invoke('select-folder');
      if (folder) {
        setLastFolder(folder);
        setIsScanning(true);
        const songs = await (window as any).ipcRenderer.invoke('scan-folder', folder);
        setFoundCount(songs.length);
        setIsScanning(false);
        onFolderSelect(songs);
      }
    } catch (err) {
      console.error('Failed to select folder:', err);
      setIsScanning(false);
    }
  };

  const handleConnectJellyfin = async () => {
    if (!jfUrl || !jfUser || !jfPass) return;
    setIsScanning(true);
    try {
      const service = new JellyfinService({ serverUrl: jfUrl, apiKey: jfKey });
      const auth = await service.authenticate(jfUser, jfPass);
      setJfKey(auth.AccessToken);
      
      const authenticatedService = new JellyfinService({ serverUrl: jfUrl, apiKey: auth.AccessToken });
      const libs = await authenticatedService.getMusicLibraries();
      setLibraries(libs);
    } catch (err) {
      alert('Erro ao conectar ao Jellyfin. Verifique o servidor, usuário e senha.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleImportLibrary = async (libId: string) => {
    setIsScanning(true);
    try {
      const service = new JellyfinService({ serverUrl: jfUrl, apiKey: jfKey });
      const songs = await service.getSongsFromLibrary(libId);
      setFoundCount(songs.length);
      onFolderSelect(songs);
    } catch (err: any) {
      console.error('Import error:', err);
      alert(`Erro ao importar biblioteca: ${err.message || 'Erro desconhecido'}`);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center p-4 transition-all duration-500"
      style={{ zIndex: 9999 }}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div 
        className="relative w-full max-w-2xl bg-zinc-900/60 backdrop-blur-3xl border border-white/20 rounded-[40px] shadow-[0_0_100px_rgba(0,0,0,0.9)] animate-zoom-in overflow-hidden"
        style={{ zIndex: 10000 }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Configurações</h2>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mb-8 p-1.5 bg-black/30 backdrop-blur-3xl rounded-[24px] border border-white/5 relative overflow-hidden">
            {[
              { id: 'local', label: 'Arquivos', icon: FolderOpen },
              { id: 'jellyfin', label: 'Jellyfin', icon: Server },
              { id: 'appearance', label: 'Aparência', icon: Palette },
              { id: 'advanced', label: 'Avançado', icon: Settings },
              { id: 'logs', label: 'Atividade', icon: Activity }
            ].map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative flex-1 py-4 text-sm font-bold rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 group
                  ${activeTab === tab.id ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="tab-highlight"
                    initial={false}
                    className="absolute inset-0 bg-white/10 border border-white/20 rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                  />
                )}
                <tab.icon size={18} className={`relative z-10 transition-transform duration-300 ${activeTab === tab.id ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span className="relative z-10">{tab.label}</span>
              </motion.button>
            ))}
          </div>

          <div className="h-[460px] overflow-hidden relative">
            <AnimatePresence mode="wait">
              {activeTab === 'local' && (
                <FilesTab 
                  isScanning={isScanning}
                  onSelectFolder={handleSelectFolder}
                  lastFolder={lastFolder}
                  foundCount={foundCount}
                />
              )}
              {activeTab === 'jellyfin' && (
                <JellyfinTab 
                  isScanning={isScanning}
                  jfUrl={jfUrl}
                  setJfUrl={setJfUrl}
                  jfUser={jfUser}
                  setJfUser={setJfUser}
                  jfPass={jfPass}
                  setJfPass={setJfPass}
                  onConnect={handleConnectJellyfin}
                  libraries={libraries}
                  onImportLibrary={handleImportLibrary}
                />
              )}
              {activeTab === 'appearance' && (
                <AppearanceTab 
                  theme={theme}
                  onThemeChange={onThemeChange}
                  thermometerColors={thermometerColors}
                  onThermometerColorsChange={onThermometerColorsChange}
                  isDynamicMercury={isDynamicMercury}
                  onDynamicMercuryChange={onDynamicMercuryChange}
                  showCustomPicker={showCustomPicker}
                  setShowCustomPicker={setShowCustomPicker}
                />
              )}
              {activeTab === 'advanced' && (
                <AdvancedTab 
                  playbackSpeed={playbackSpeed}
                  onSpeedChange={onSpeedChange}
                  bassBoost={bassBoost}
                  onBassChange={onBassChange}
                />
              )}
              {activeTab === 'logs' && (
                <ActivityTab 
                  onClearCache={onClearCache || (() => {})}
                  thermometerColors={thermometerColors}
                />
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="p-4 bg-white/5 border-t border-white/10 flex justify-end">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="px-10 py-3 text-sm font-bold text-white hover:bg-white/10 rounded-xl transition-all outline-none"
          >
            Fechar
          </motion.button>
        </div>
      </div>
    </div>
  );
}
