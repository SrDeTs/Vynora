import { Song } from '../types/Song';

export interface JellyfinConfig {
  serverUrl: string;
  apiKey: string;
  userId?: string;
}

export class JellyfinService {
  private config: JellyfinConfig;

  constructor(config: JellyfinConfig) {
    this.config = config;
  }

  private getUrl(path: string): string {
    const baseUrl = this.config.serverUrl.endsWith('/') 
      ? this.config.serverUrl.slice(0, -1) 
      : this.config.serverUrl;
    return `${baseUrl}${path}`;
  }

  private getHeaders() {
    return {
      'X-Emby-Token': this.config.apiKey,
      'Content-Type': 'application/json',
      'X-Emby-Authorization': 'MediaBrowser Client="Vynora", Device="Desktop", DeviceId="vynora-app", Version="1.0.0"'
    };
  }

  async authenticate(username: string, password: string): Promise<{ AccessToken: string, UserId: string }> {
    try {
      const response = await fetch(this.getUrl('/Users/AuthenticateByName'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Emby-Authorization': 'MediaBrowser Client="Vynora", Device="Desktop", DeviceId="vynora-app", Version="1.0.0"'
        },
        body: JSON.stringify({
          Username: username,
          Pw: password
        })
      });

      if (!response.ok) {
        throw new Error('Falha na autenticação. Verifique o usuário e a senha.');
      }

      const data = await response.json();
      return {
        AccessToken: data.AccessToken,
        UserId: data.User.Id
      };
    } catch (error) {
      console.error('Jellyfin: Authentication failed', error);
      throw error;
    }
  }

  async getMusicLibraries() {
    try {
      const response = await fetch(this.getUrl('/Library/VirtualFolders'), {
        headers: this.getHeaders()
      });
      const data = await response.json();
      // Use ItemId as the primary identifier if available, as /Items?ParentId= expects the ItemId
      return data
        .filter((folder: any) => folder.CollectionType === 'music')
        .map((folder: any) => ({
          ...folder,
          Id: folder.ItemId || folder.Id
        }));
    } catch (error) {
      console.error('Jellyfin: Failed to get libraries', error);
      throw error;
    }
  }

  async getSongsFromLibrary(libraryId: string): Promise<Song[]> {
    try {
      // Simplified fields to avoid 400 error on some versions
      const fields = 'PrimaryImageAspectRatio,RunTimeTicks';
      const url = this.getUrl(`/Items?ParentId=${libraryId}&Recursive=true&IncludeItemTypes=Audio&Fields=${fields}&Limit=500`);
      console.log('Jellyfin: Fetching songs from', url);
      
      const response = await fetch(url, { headers: this.getHeaders() });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP Error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      if (!data.Items) return [];
      
      return data.Items.map((item: any) => ({
        id: `jellyfin-${item.Id}`,
        title: item.Name || 'Sem Título',
        artist: (item.Artists && item.Artists.length > 0) ? item.Artists[0] : (item.AlbumArtist || 'Artista Desconhecido'),
        albumName: item.Album || 'Álbum Desconhecido',
        albumCover: this.getUrl(`/Items/${item.Id}/Images/Primary`),
        duration: item.RunTimeTicks ? Math.round(item.RunTimeTicks / 10000000) : 0,
        localPath: this.getUrl(`/Audio/${item.Id}/stream?static=true&api_key=${this.config.apiKey}`)
      }));
    } catch (error) {
      console.error('Jellyfin: Failed to get songs', error);
      throw error;
    }
  }
}
