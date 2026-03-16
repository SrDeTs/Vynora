import React from 'react';
import { Reorder, motion, AnimatePresence } from 'framer-motion';
import { Song } from '../types/Song';
import { useResponsive } from '../hooks/useResponsive';

interface SongGridProps {
  songs: Song[];
  onReorder: (newSongs: Song[]) => void;
  onSongSelect: (song: Song) => void;
  selectedSong: Song | null;
  getCover?: (song: Song) => string | null;
  isSongLoading?: (songId: string) => boolean;
}

export function SongGrid({ 
  songs, 
  onReorder, 
  onSongSelect, 
  selectedSong,
  getCover,
  isSongLoading
}: SongGridProps) {
  const { isMobile } = useResponsive();

  const gridConfig = isMobile 
    ? "grid-cols-2 md:grid-cols-3" 
    : "grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 h-[500px] vynora-scrollbar overflow-y-auto">
      <Reorder.Group 
        axis="y" 
        values={songs} 
        onReorder={onReorder}
        className={`grid ${gridConfig} gap-6`}
      >
        <AnimatePresence mode="popLayout">
          {songs.map((song) => (
            <Reorder.Item
              key={song.id}
              value={song}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileDrag={{ 
                scale: 1.1, 
                boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
                zIndex: 50
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
              className={`relative aspect-square rounded-2xl cursor-grab active:cursor-grabbing group overflow-visible
                ${selectedSong?.id === song.id ? 'ring-2 ring-white ring-offset-4 ring-offset-black/50' : ''}`}
              onClick={() => onSongSelect(song)}
            >
              <div className="w-full h-full relative rounded-2xl overflow-hidden shadow-xl border border-white/10 group-hover:border-white/20 transition-colors">
                {getCover && getCover(song) ? (
                  <img
                    src={getCover(song)!}
                    alt={song.title}
                    draggable={false}
                    className="w-full h-full object-cover select-none"
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                    <span className="text-zinc-500 text-[10px] text-center px-2">{song.artist}</span>
                  </div>
                )}
                
                {/* Overlay Text on Hover or Selected */}
                <div className={`absolute inset-0 bg-black/60 flex flex-col items-center justify-end p-3 transition-opacity duration-300
                  ${selectedSong?.id === song.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  <p className="text-white text-xs font-bold truncate w-full text-center">{song.title}</p>
                  <p className="text-white/60 text-[9px] truncate w-full text-center">{song.artist}</p>
                </div>

                {isSongLoading && isSongLoading(song.id) && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  </div>
                )}
              </div>
              
              {/* Center Glow for Selected */}
              {selectedSong?.id === song.id && (
                <div className="absolute -inset-1 bg-white/5 blur-xl rounded-2xl -z-10" />
              )}
            </Reorder.Item>
          ))}
        </AnimatePresence>
      </Reorder.Group>
    </div>
  );
}
