const { contextBridge, ipcRenderer } = require('electron');
const Database = require('better-sqlite3');
const fs = require('fs');

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
            this.db = new Database(`./renderer/databases/db_${name}`);
        },
        initialise: () => {
            const stmt = this.db.prepare(`
                CREATE TABLE items (
                    ItemID INTEGER PRIMARY KEY,
                    ItemName TEXT UNIQUE NOT NULL,
                    ItemDescription TEXT,
                    ItemQuantity INTEGER
                )
            `);

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
        },
        insert: values => {
            const stmt = this.db.prepare(`
                INSERT INTO items
                VALUES (NULL, '${values.itemName}', '${values.itemDescription}', ${values.itemQuantity})
            `);

            const info = stmt.run();
            return info;
        },
        deleteItem: itemId => {
            const stmt = this.db.prepare(`
                DELETE FROM items
                WHERE ItemID = ${itemId}
            `);

            const info = stmt.run();
            return info;
        }
    }
);
contextBridge.exposeInMainWorld(
    //allow renderer process to use fs
    'fs',
    {
        readdir: (path, options, callback) => {
            ipcRenderer.send('fs', {type:'readdir', path, options, callback});
        },
        unlink: (path, callback) => {
            fs.unlink(path, callback);
        }
    }
);

