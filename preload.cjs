const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  platform: process.platform,
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  openLink: (url) => ipcRenderer.invoke('open-external', url),
  print: () => ipcRenderer.send('print-page')
});
