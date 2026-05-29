import { contextBridge, ipcRenderer } from 'electron';
contextBridge.exposeInMainWorld('electronAPI', {
    getVersion: () => ipcRenderer.invoke('get-version'),
    runCode: (code, language) => ipcRenderer.invoke('run-code', code, language)
});
