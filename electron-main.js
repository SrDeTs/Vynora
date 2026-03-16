import { app, BrowserWindow, Menu, ipcMain, dialog } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import crypto from 'crypto';
import * as musicMetadata from 'music-metadata';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false // Necessary for local file access and external images
    },
    backgroundColor: '#000000',
    icon: path.join(__dirname, 'Vynora.png'),
    title: 'Vynora',
    autoHideMenuBar: true
  });

  const coversDir = path.join(app.getPath('userData'), 'covers');
  if (!fs.existsSync(coversDir)) {
    fs.mkdirSync(coversDir, { recursive: true });
  }

  Menu.setApplicationMenu(null);

  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }
}

// IPC Handlers for Local Music
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });
  return result.filePaths[0];
});

function getCoverPath(artist, album) {
  const coversDir = path.join(app.getPath('userData'), 'covers');
  // Create a stable hash based on artist and album to avoid file system issues
  const hash = crypto.createHash('md5').update(`${artist || 'unknown'}-${album || 'unknown'}`).digest('hex');
  return path.join(coversDir, `${hash}.jpg`);
}

ipcMain.handle('save-external-cover', async (event, { artist, album, url }) => {
  const coverPath = getCoverPath(artist, album);
  
  if (fs.existsSync(coverPath)) return `file://${coverPath}`;

  try {
    const response = await fetch(url);
    const buffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(coverPath, buffer);
    return `file://${coverPath}`;
  } catch (error) {
    console.error('Failed to save external cover:', error);
    return url; // Fallback to original URL
  }
});

ipcMain.handle('scan-folder', async (event, folderPath) => {
  const supportedExtensions = ['.mp3', '.m4a', '.flac', '.wav', '.ogg'];
  const songs = [];

  async function scan(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        await scan(fullPath);
      } else if (supportedExtensions.includes(path.extname(file).toLowerCase())) {
        try {
          const metadata = await musicMetadata.parseFile(fullPath);
          let albumCover = null;
          
          const artist = metadata.common.artist || 'Artista Desconhecido';
          const album = metadata.common.album || 'Álbum Desconhecido';
          const coverPath = getCoverPath(artist, album);

          // Priority 1: Check if we already have a cached version
          if (fs.existsSync(coverPath)) {
            albumCover = `file://${coverPath}`;
          } 
          // Priority 2: Extract embedded picture if cache doesn't exist
          else if (metadata.common.picture && metadata.common.picture.length > 0) {
            try {
              const pic = metadata.common.picture[0];
              fs.writeFileSync(coverPath, pic.data);
              albumCover = `file://${coverPath}`;
            } catch (saveErr) {
              console.error('Error saving embedded cover:', saveErr);
            }
          }

          songs.push({
            id: fullPath,
            title: metadata.common.title || path.basename(file, path.extname(file)),
            artist: artist,
            albumName: album,
            year: metadata.common.year,
            albumCover: albumCover,
            localPath: fullPath,
            duration: metadata.format.duration
          });
        } catch (err) {
          console.error(`Error parsing ${fullPath}:`, err);
        }
      }
    }
  }

  await scan(folderPath);
  return songs;
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
