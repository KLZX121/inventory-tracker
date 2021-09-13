const { contextBridge, ipcRenderer } = require('electron');
const Database = require('better-sqlite3');

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
contextBridge.exposeInMainWorld(
    //allows renderer process to access electron-store api
    'store',
    {
        set: obj => {
            ipcRenderer.send('store', {type: 'set', obj});
        },
        get: key => {
            return ipcRenderer.sendSync('store', {type: 'get', key});
        },
        getAll: () => {
            return ipcRenderer.sendSync('store', {type: 'getAll'});
        },
        clearAll: () => {
            ipcRenderer.send('store', {type: 'clearAll'});
        },
        delete: key => {
            ipcRenderer.send('store', {type: 'delete', key})
        }
    }
);

contextBridge.exposeInMainWorld(
    //allow renderer process to use sqlite3 package
    'db',
    {
        db: null,
        openDb: name => {
            this.db = new Database(name)
        },
        initialise: () => {
            const stmt = this.db.prepare(`CREATE TABLE items (
                ItemID INTEGER PRIMARY KEY AUTOINCREMENT,
                ItemName TEXT UNIQUE NOT NULL,
                ItemDescription TEXT,
                ItemQuantity INTEGER
            )`);

            const info = stmt.run();
            return info;
        },
        delete: () => {
            this.db.close();
            this.db = null;
        },
        getAll: () => {
            const stmt = this.db.prepare('SELECT * FROM items');

            const data = stmt.all();
            return data;
        }
    }
);

