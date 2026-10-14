const {
  app,
  BrowserWindow,
  shell,
  ipcMain,
  session
} = require('electron');

const path = require('path');

function allowedExternalURL(value) {
  try {
    const url = new URL(value);
    return ['https:', 'http:', 'mailto:', 'tel:'].includes(url.protocol);
  } catch {
    return false;
  }
}

ipcMain.handle('open-external', async (_event, value) => {
  if (typeof value !== 'string' || !allowedExternalURL(value)) {
    return false;
  }

  await shell.openExternal(value);
  return true;
});

ipcMain.on('print-page', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) win.webContents.print({ printBackground: true });
});



function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  win.loadFile(path.join(__dirname, 'www', 'index.html'));

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (allowedExternalURL(url)) {
      shell.openExternal(url).catch(() => {});
      }
    return { action: 'deny' };
  });

  win.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('file://')) {
      event.preventDefault();
      if (allowedExternalURL(url)) {
        shell.openExternal(url).catch(() => {});
      }
    }
  });
}

app.whenReady().then(() => {
  session.defaultSession.setPermissionRequestHandler(
    (_webContents, permission, callback) => {
      callback(['media'].includes(permission));
    }
  );

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
