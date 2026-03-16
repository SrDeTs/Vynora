export interface Song {
  id: string;
  title: string;
  artist: string;
  albumCover: string | null;
  youtubeId?: string;
  albumName?: string;
  year?: number;
  localPath?: string;
  duration?: number;
}