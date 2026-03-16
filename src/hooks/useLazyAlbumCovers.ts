import { useState, useEffect, useRef, useCallback } from 'react';
import { Song } from '../types/Song';
import { itunesApiService } from '../services/itunesApiService';

interface LazyLoadState {
  loadedCovers: Map<string, string>;
  loadingCovers: Set<string>;
  failedCovers: Set<string>;
  loadedCount: number;
}

interface UseLazyAlbumCoversProps {
  songs: Song[];
  centerIndex: number;
  preloadRadius?: number; // How many songs around center to preload
  lazyLoadRadius?: number; // How many songs around visible area to lazy load
}

interface UseLazyAlbumCoversReturn {
  getSongCover: (song: Song) => string;
  isSongLoading: (songId: string) => boolean;
  isSongFailed: (songId: string) => boolean;
  loadedCount: number;
  totalCount: number;
  loadingProgress: number;
  preloadCoversBatch: (songs: Song[]) => Promise<void>;
  clearCache: () => void;
}

export function useLazyAlbumCovers({
  songs,
  centerIndex,
  preloadRadius = 5,
  lazyLoadRadius = 10
}: UseLazyAlbumCoversProps): UseLazyAlbumCoversReturn {
  
  const [state, setState] = useState<LazyLoadState>({
    loadedCovers: new Map(),
    loadingCovers: new Set(),
    failedCovers: new Set(),
    loadedCount: 0
  });
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const loadingQueue = useRef<Set<string>>(new Set());
  
  // Load a single album cover
  const loadAlbumCover = useCallback(async (song: Song, signal?: AbortSignal): Promise<void> => {
    const songKey = `${song.artist}-${song.title}`;
    
    // Skip if already loaded, loading, or failed
    if (state.loadedCovers.has(songKey) || state.loadingCovers.has(songKey) || state.failedCovers.has(songKey)) {
      return;
    }
    
    // Add to loading queue
    if (loadingQueue.current.has(songKey)) {
      return;
    }
    
    // Priority 1: Use embedded/cached cover if available from scan
    if (song.albumCover && (song.albumCover.startsWith('file://') || song.albumCover.startsWith('data:'))) {
      setState(prev => {
        const newLoadedCovers = new Map(prev.loadedCovers);
        newLoadedCovers.set(songKey, song.albumCover!);
        return {
          ...prev,
          loadedCovers: newLoadedCovers,
          loadedCount: newLoadedCovers.size
        };
      });
      return;
    }

    loadingQueue.current.add(songKey);
    
    setState(prev => ({
      ...prev,
      loadingCovers: new Set([...prev.loadingCovers, songKey])
    }));
    
    try {
      if (signal?.aborted) throw new Error('Request aborted');
      
      // Target URL for the cover
      let albumCover = await itunesApiService.searchWithRetry(song.artist, song.title);
      
      if (signal?.aborted) throw new Error('Request aborted');
      
      // If iTunes finds a cover, save it to disk for future use
      if (albumCover && albumCover.startsWith('http')) {
        try {
          // Use the new IPC handler to save to local disk cache
          // This avoids re-downloading next time
          const localUrl = await (window as any).ipcRenderer.invoke('save-external-cover', {
            artist: song.artist,
            album: song.albumName || 'unknown',
            url: albumCover
          });
          if (localUrl) {
            albumCover = localUrl;
          }
        } catch (saveError) {
          console.error('Failed to persist iTunes cover to disk:', saveError);
        }
      }

      // Preload the image if found (regardless of source)
      if (albumCover) {
        await new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('Image load failed'));
          img.src = albumCover!;
          setTimeout(() => reject(new Error('Image load timeout')), 10000);
        });
      }
      
      setState(prev => {
        const newLoadedCovers = new Map(prev.loadedCovers);
        const newLoadingCovers = new Set(prev.loadingCovers);
        const newFailedCovers = new Set(prev.failedCovers);
        
        if (albumCover) {
          newLoadedCovers.set(songKey, albumCover);
        } else {
          newFailedCovers.add(songKey);
        }
        
        newLoadingCovers.delete(songKey);
        
        return {
          ...prev,
          loadedCovers: newLoadedCovers,
          loadingCovers: newLoadingCovers,
          failedCovers: newFailedCovers,
          loadedCount: newLoadedCovers.size
        };
      });
      
    } catch (error: any) {
      if (signal?.aborted || error.message === 'Request aborted') {
        // Silently handle aborts
      } else {
        console.error(`❌ Error loading cover for: ${song.artist} - ${song.title}`, error);
        setState(prev => {
          const newLoadingCovers = new Set(prev.loadingCovers);
          const newFailedCovers = new Set(prev.failedCovers);
          newLoadingCovers.delete(songKey);
          newFailedCovers.add(songKey);
          return {
            ...prev,
            loadingCovers: newLoadingCovers,
            failedCovers: newFailedCovers
          };
        });
      }
    } finally {
      loadingQueue.current.delete(songKey);
    }
  }, [state.loadedCovers, state.loadingCovers, state.failedCovers]);
  
  // Load covers for songs in priority order
  const loadCoversBatch = useCallback(async (songsToLoad: Song[]): Promise<void> => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    
    for (let i = 0; i < songsToLoad.length; i++) {
      if (signal.aborted) break;
      await loadAlbumCover(songsToLoad[i], signal);
      if (i < songsToLoad.length - 1 && !signal.aborted) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
  }, [loadAlbumCover]);
  
  useEffect(() => {
    if (songs.length === 0) return;
    
    const timer = setTimeout(() => {
      const songsToLoad: Song[] = [];
      const preloadStart = Math.max(0, centerIndex - preloadRadius);
      const preloadEnd = Math.min(songs.length - 1, centerIndex + preloadRadius);
      
      for (let i = preloadStart; i <= preloadEnd; i++) {
        const songKey = `${songs[i].artist}-${songs[i].title}`;
        if (!state.loadedCovers.has(songKey) && !state.loadingCovers.has(songKey)) {
          songsToLoad.push(songs[i]);
        }
      }
      
      const lazyStart = Math.max(0, centerIndex - lazyLoadRadius);
      const lazyEnd = Math.min(songs.length - 1, centerIndex + lazyLoadRadius);
      
      for (let i = lazyStart; i <= lazyEnd; i++) {
        if (i < preloadStart || i > preloadEnd) {
          const songKey = `${songs[i].artist}-${songs[i].title}`;
          if (!state.loadedCovers.has(songKey) && !state.loadingCovers.has(songKey)) {
            songsToLoad.push(songs[i]);
          }
        }
      }
      
      if (songsToLoad.length > 0) {
        loadCoversBatch(songsToLoad);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [songs, centerIndex, preloadRadius, lazyLoadRadius, loadCoversBatch, state.loadedCovers, state.loadingCovers]);
  
  const getSongCover = useCallback((song: Song): string => {
    const songKey = `${song.artist}-${song.title}`;
    return state.loadedCovers.get(songKey) || 
           song.albumCover || 
           itunesApiService.getFallbackArtwork(song.artist, song.title);
  }, [state.loadedCovers]);
  
  const isSongLoading = useCallback((songId: string): boolean => {
    const song = songs.find(s => s.id === songId);
    if (!song) return false;
    const songKey = `${song.artist}-${song.title}`;
    return state.loadingCovers.has(songKey);
  }, [songs, state.loadingCovers]);
  
  const isSongFailed = useCallback((songId: string): boolean => {
    const song = songs.find(s => s.id === songId);
    if (!song) return false;
    const songKey = `${song.artist}-${song.title}`;
    return state.failedCovers.has(songKey);
  }, [songs, state.failedCovers]);
  
  const preloadCoversBatch = useCallback(async (songsToPreload: Song[]): Promise<void> => {
    await loadCoversBatch(songsToPreload);
  }, [loadCoversBatch]);
  
  const clearCache = useCallback((): void => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setState({
      loadedCovers: new Map(),
      loadingCovers: new Set(),
      failedCovers: new Set(),
      loadedCount: 0
    });
    itunesApiService.clearCache();
    loadingQueue.current.clear();
  }, []);
  
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);
  
  const loadingProgress = songs.length > 0 ? (state.loadedCount / songs.length) * 100 : 0;
  
  return {
    getSongCover,
    isSongLoading,
    isSongFailed,
    loadedCount: state.loadedCount,
    totalCount: songs.length,
    loadingProgress,
    preloadCoversBatch,
    clearCache
  };
}