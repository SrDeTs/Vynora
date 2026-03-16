import React, { useState, useEffect } from 'react';
import { CoverFlow } from './components/CoverFlow';
import { SearchBar } from './components/SearchBar';
import { Player } from './components/Player';
import { Song } from './types/Song';
import { SettingsButton } from './components/SettingsButton';
import { SettingsModal } from './components/SettingsModal';
import { Music, Settings } from 'lucide-react';
import { useLazyAlbumCovers } from './hooks/useLazyAlbumCovers';
import { VolumeThermometer } from './components/VolumeThermometer';
import { SnowParticles } from './components/SnowParticles';
import { logger } from './utils/logger';
import { ElectricBorderAnimation } from './components/shared/ElectricBorderAnimation';

// Expose to window for modal access
(window as any).logs = [];
logger.subscribe(newLogs => {
  (window as any).logs = newLogs;
});

export default function App() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hasLoadedLibrary, setHasLoadedLibrary] = useState(false);

  // Lazy loading covers hook
  const { getSongCover, isSongLoading, clearCache } = useLazyAlbumCovers({
    songs,
    centerIndex: currentIndex
  });
  
  // Extra settings states
  const [theme, setTheme] = useState(localStorage.getItem('vynora_theme') || 'glass');
  const [playbackSpeed, setPlaybackSpeed] = useState(Number(localStorage.getItem('vynora_speed')) || 1);
  const [bassBoost, setBassBoost] = useState(localStorage.getItem('vynora_bass') === 'true');
  const [volume, setVolume] = useState(Number(localStorage.getItem('vynora_volume')) || 0.7);
  const [thermometerColors, setThermometerColors] = useState<string[]>(() => {
    const saved = localStorage.getItem('vynora_mercury_colors');
    // Premium Mercury Palette: Deep Sapphire, Electric Cyan, Emerald, Chrome, Crimson
    return saved ? JSON.parse(saved) : ['#0f172a', '#06b6d4', '#10b981', '#94a3b8', '#e11d48'];
  });
  const [isDynamicMercury, setIsDynamicMercury] = useState(() => {
    return localStorage.getItem('vynora_is_dynamic_mercury') !== 'false';
  });
  const [isElectricEnabled, setIsElectricEnabled] = useState(() => {
    return localStorage.getItem('vynora_is_electric_enabled') !== 'false';
  });

  useEffect(() => {
    localStorage.setItem('vynora_theme', theme);
    localStorage.setItem('vynora_speed', playbackSpeed.toString());
    localStorage.setItem('vynora_bass', bassBoost.toString());
    localStorage.setItem('vynora_volume', volume.toString());
    localStorage.setItem('vynora_mercury_colors', JSON.stringify(thermometerColors));
    localStorage.setItem('vynora_is_dynamic_mercury', isDynamicMercury.toString());
    localStorage.setItem('vynora_is_electric_enabled', isElectricEnabled.toString());
  }, [theme, playbackSpeed, bassBoost, volume, thermometerColors, isDynamicMercury, isElectricEnabled]);

  // Initialize library from localStorage if available
  useEffect(() => {
    const savedSongs = localStorage.getItem('vynora_library');
    if (savedSongs) {
      try {
        const parsed = JSON.parse(savedSongs);
        if (parsed.length > 0) {
          setSongs(parsed);
          setSelectedSong(parsed[Math.floor(parsed.length / 2)]);
          setHasLoadedLibrary(true);
        }
      } catch (e) {
        console.error('Failed to load saved library', e);
      }
    }
  }, []);

  // Global handle for Space key (Play/Pause)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in search bar
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const handleFolderLoaded = (newSongs: Song[]) => {
    setSongs(newSongs);
    setSelectedSong(newSongs[Math.floor(newSongs.length / 2)]);
    setCurrentIndex(Math.floor(newSongs.length / 2));
    setHasLoadedLibrary(true);
    setIsSettingsOpen(false);
    localStorage.setItem('vynora_library', JSON.stringify(newSongs));
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      // Reload from storage or current state if search cleared
      return;
    }
  };

  const handleSongSelect = (song: Song) => {
    setSelectedSong(song);
    setIsPlaying(true);
    
    const index = songs.findIndex(s => s.id === song.id);
    if (index !== -1) {
      setCurrentIndex(index);
    }
  };

  const handlePlayingChange = (playing: boolean) => {
    setIsPlaying(playing);
  };

  const filteredSongs = searchQuery.trim() 
    ? songs.filter(s => 
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        s.artist.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : songs;

  const displayText = searchQuery 
    ? `${filteredSongs.length} resultados para "${searchQuery}"`
    : hasLoadedLibrary ? `Minha Biblioteca (${songs.length} músicas)` : "Vynora Player";

  const [bgImages, setBgImages] = useState({ current: '', previous: '' });

  useEffect(() => {
    if (selectedSong) {
      const newCover = getSongCover(selectedSong);
      if (newCover !== bgImages.current) {
        setBgImages(prev => ({ 
          previous: prev.current || newCover, 
          current: newCover 
        }));
      }
    }
  }, [selectedSong]);

  return (
    <div 
      className={`h-screen text-white overflow-hidden relative flex flex-col theme-${theme} transition-all duration-700 ease-in-out`}
      style={{
        zIndex: 1,
        position: 'relative',
        width: '100vw',
        height: '100vh',
        isolation: 'isolate'
      }}
    >
      <SnowParticles intensity={volume} />

      {/* Background Dinâmico - Crossfade Real entre duas camadas */}
      <div 
        className="fixed inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex: 0 }}
      >
        {/* Camada Prévia */}
        <div 
          className="absolute inset-0 transition-opacity duration-[2500ms] animate-video-bg"
          style={{
            backgroundImage: bgImages.previous ? `url(${bgImages.previous})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(110px) brightness(0.25) saturate(2.5)',
            opacity: 0.85,
          }}
        />
        
        {/* Camada Atual (Sobrepõe a anterior) */}
        <div 
          className="absolute inset-0 transition-opacity duration-[2500ms] animate-video-bg"
          style={{
            backgroundImage: bgImages.current ? `url(${bgImages.current})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(110px) brightness(0.25) saturate(2.5)',
            opacity: selectedSong ? 0.85 : 0,
          }}
        />
        
        {/* Camadas Estéticas */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent animate-pulse-slow" style={{ mixBlendMode: 'soft-light' }} />
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />
        <div className="absolute inset-0 bg-radial-vignette opacity-50" />
      </div>

      {/* Reflective floor */}
      <div 
        className="fixed bottom-0 left-0 right-0 h-1/2 pointer-events-none opacity-20"
        style={{
          background: 'linear-gradient(to top, rgba(255,255,255,0.05) 0%, transparent 100%)',
          zIndex: 0
        }}
      />
      
      {/* Header simplificado */}
      <div className="relative flex items-center justify-between p-4 bg-black/40 backdrop-blur-xl border-b border-white/5" style={{ zIndex: 500 }}>
        <div className="w-10"></div>
        <div className="text-sm font-medium text-gray-300 tracking-wider uppercase">
          {displayText}
        </div>
        <SettingsButton onClick={() => setIsSettingsOpen(true)} />
      </div>

      {/* Main Content Area with conditional blur */}
      <div 
        className={`relative flex-1 flex flex-col transition-all duration-500 ${isSettingsOpen ? 'blur-md opacity-20 scale-[0.98]' : 'blur-0 opacity-100 scale-100'}`}
        style={{ zIndex: 100 }}
      >
        <ElectricBorderAnimation 
          isActive={isPlaying} 
          isEnabled={isElectricEnabled}
          intensity={volume}
          color={thermometerColors[0]}
        >
          {/* Search Bar */}
          <div className="relative p-6 w-full max-w-2xl mx-auto" style={{ zIndex: 450 }}>
            <SearchBar onSearch={handleSearch} />
          </div>

          {/* Dynamic Content */}
          <div className="relative flex-1 flex flex-col items-center justify-center px-4 md:px-8 pb-12" style={{ zIndex: 200 }}>
            {!hasLoadedLibrary ? (
              <div className="flex flex-col items-center justify-center gap-8 text-center animate-in fade-in zoom-in-95 duration-1000">
                <div className="relative">
                  <div className="absolute inset-0 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
                  <div className="w-32 h-32 bg-zinc-900 rounded-3xl flex items-center justify-center border border-white/10 shadow-2xl relative">
                    <Music size={48} className="text-white/20" />
                  </div>
                </div>
                <div className="space-y-3">
                  <h2 className="text-3xl font-light tracking-tight">O Vynora está vazio</h2>
                  <p className="text-gray-400 max-w-sm font-light leading-relaxed">
                    Configure sua biblioteca para transformar seu desktop em uma galeria sonora.
                  </p>
                </div>
                <button 
                  onClick={() => setIsSettingsOpen(true)}
                  className="px-10 py-4 bg-white text-black rounded-full font-semibold hover:bg-gray-200 transition-all active:scale-95 shadow-xl"
                >
                  Configurar Biblioteca
                </button>
              </div>
            ) : filteredSongs.length === 0 ? (
              <div className="text-center text-gray-400 py-20">
                <p className="text-lg font-light">Nenhuma música encontrada para "{searchQuery}"</p>
                <button 
                  onClick={() => setSearchQuery('')}
                  className="mt-4 text-blue-400 hover:underline"
                >
                  Limpar busca
                </button>
              </div>
            ) : (
              <>
                <div className="w-full flex-1 flex items-center justify-center overflow-visible">
                  <CoverFlow 
                    songs={filteredSongs} 
                    onSongSelect={handleSongSelect}
                    selectedSong={selectedSong}
                    isPlaying={isPlaying}
                    getCover={getSongCover}
                    isLoading={isSongLoading}
                  />
                </div>
                
                {selectedSong && (
                  <div className="mt-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <h2 className="text-2xl font-light mb-1 text-white drop-shadow-md">
                      {selectedSong.title}
                    </h2>
                    <h3 className="text-lg font-light text-gray-400 mb-6 drop-shadow-sm">
                      {selectedSong.artist}
                    </h3>
                    <Player 
                      selectedSong={selectedSong}
                      isPlayingProp={isPlaying}
                      onPlayingChange={handlePlayingChange}
                      playbackSpeed={playbackSpeed}
                      bassBoost={bassBoost}
                      volume={volume}
                      onNext={() => {
                        const nextIndex = (currentIndex + 1) % filteredSongs.length;
                        handleSongSelect(filteredSongs[nextIndex]);
                      }}
                      onPrevious={() => {
                        const prevIndex = (currentIndex - 1 + filteredSongs.length) % filteredSongs.length;
                        handleSongSelect(prevIndex >= 0 ? filteredSongs[prevIndex] : filteredSongs[filteredSongs.length - 1]);
                      }}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </ElectricBorderAnimation>
      </div>

      {/* Volume Thermometer - Rendered via Portal inside the component */}
      {hasLoadedLibrary && !isSettingsOpen && (
        <VolumeThermometer 
          volume={volume}
          onVolumeChange={setVolume}
          customColors={isDynamicMercury ? [] : thermometerColors}
        />
      )}

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onFolderSelect={handleFolderLoaded}
        theme={theme}
        onThemeChange={setTheme}
        playbackSpeed={playbackSpeed}
        onSpeedChange={setPlaybackSpeed}
        bassBoost={bassBoost}
        onBassChange={setBassBoost}
        onClearCache={clearCache}
        thermometerColors={thermometerColors}
        onThermometerColorsChange={setThermometerColors}
        isDynamicMercury={isDynamicMercury}
        onDynamicMercuryChange={setIsDynamicMercury}
        isElectricEnabled={isElectricEnabled}
        onElectricEnabledChange={setIsElectricEnabled}
      />
    </div>
  );
}