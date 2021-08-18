const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld(
    //allows renderer process (index.js) to access electron api through window.app
    'app',
    {
        // get app version using electron's app api
        getVersion: async () => {
            return await ipcRenderer.invoke('getVersion', null);
        }
    }
);

