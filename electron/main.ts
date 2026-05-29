import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import fs from 'fs';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true 
    },
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#1e293b',
      symbolColor: '#f8fafc',
      height: 30
    }
  });

  if (app.isPackaged) {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  } else {
    mainWindow.loadURL('http://localhost:5173');
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle('get-version', () => app.getVersion());

// Handle running code locally
ipcMain.handle('run-code', async (_event, code: string, language: string) => {
  return new Promise((resolve) => {
    const tempDir = os.tmpdir();
    const timestamp = Date.now();
    let filePath = "";
    let cmd;

    try {
      if (language === 'python') {
        filePath = path.join(tempDir, `tutorai_temp_${timestamp}.py`);
        fs.writeFileSync(filePath, code);
        const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
        cmd = `${pythonCmd} "${filePath}"`;
      } else if (language === 'javascript' || language === 'js' || language === 'node') {
        filePath = path.join(tempDir, `tutorai_temp_${timestamp}.js`);
        fs.writeFileSync(filePath, code);
        cmd = `node "${filePath}"`;
      } else {
        resolve({ success: false, output: `Language '${language}' is not supported yet.` });
        return;
      }
      
      exec(cmd, { timeout: 5000 }, (error, stdout, stderr) => {
        try { fs.unlinkSync(filePath); } catch (e) { /* ignore */ }

        if (error) {
           if (error.killed) {
              resolve({ success: false, output: "Execution timed out (5s limit)" });
           } else {
              resolve({ success: false, output: stderr || error.message });
           }
           return;
        }
        
        if (stderr) {
          resolve({ success: false, output: stderr });
          return;
        }

        resolve({ success: true, output: stdout });
      });
    } catch (err: any) {
      try { if (filePath) fs.unlinkSync(filePath); } catch (e) { /* ignore */ }
      resolve({ success: false, output: `Error creating temp file: ${err.message}` });
    }
  });
});
