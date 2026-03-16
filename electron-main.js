import { app, BrowserWindow, Menu, ipcMain, dialog } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
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
    title: 'Vynora',
    autoHideMenuBar: true
  });

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
  if (result.canceled) return null;
  return result.filePaths[0];
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
          
          if (metadata.common.picture && metadata.common.picture.length > 0) {
            const pic = metadata.common.picture[0];
            const base64 = pic.data.toString('base64');
            albumCover = `data:${pic.format};base64,${base64}`;
          }

          songs.push({
            id: fullPath, // Use path as ID
            title: metadata.common.title || path.basename(file, path.extname(file)),
            artist: metadata.common.artist || 'Artista Desconhecido',
            albumName: metadata.common.album || 'Álbum Desconhecido',
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
