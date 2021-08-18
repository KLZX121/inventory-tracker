const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld(
    'app',
    {
        getVersion: async () => {
            return await ipcRenderer.invoke('getVersion', null);
        }
    }
);

