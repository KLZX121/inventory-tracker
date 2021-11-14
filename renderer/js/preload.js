const { contextBridge, ipcRenderer } = require('electron');
const Database = require('better-sqlite3');
const fs = require('fs');
const network = require('./network.js');
const http = require('http');
const WS = require('ws');
const path = require('path');

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
    //expose electron-store api
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
    //expose sqlite3 package
    'db',
    {
        db: null,
        openDb: async name => {
            const userDataPath = await ipcRenderer.invoke('path', 'userData');
            this.db = new Database(path.join(userDataPath, `${name}.db`));
            return;
        },
        initialise: () => {
            const stmt = this.db.prepare(`
                CREATE TABLE items (
                    ItemID INTEGER PRIMARY KEY AUTOINCREMENT,
                    ItemCode TEXT UNIQUE NOT NULL,
                    ItemName TEXT UNIQUE NOT NULL,
                    ItemDescription TEXT,
                    ItemQuantity INTEGER,
                    ItemMinQuantity INTEGER
                )
            `);

            const info = stmt.run();
            return info;
        },
        delete: async (name, callback) => {
            this.db = null;
            const userDataPath = await ipcRenderer.invoke('path', 'userData');
            fs.unlink(path.join(userDataPath, `${name}.db`), error => {
                if (error) console.error(error);
                callback();
            });
        },
        get: itemId => {
            const stmt = this.db.prepare(`
                SELECT * FROM items
                WHERE ItemID = ${itemId}
            `);

            const data = stmt.get();
            return data;
        },
        getAll: () => {
            const stmt = this.db.prepare('SELECT * FROM items');

            const data = stmt.all();
            return data;
        },
        getId: () => {
            const stmt = this.db.prepare("SELECT seq FROM SQLITE_SEQUENCE WHERE name='items'");

            const data = stmt.get();
            return data;
        },
        insert: values => {
            const stmt = this.db.prepare(`
                INSERT INTO items (ItemID, ItemCode, ItemName, ItemDescription, ItemQuantity, ItemMinQuantity)
                VALUES (NULL, '${values.itemCode}', '${values.itemName}', '${values.itemDescription}', ${values.itemQuantity}, ${values.itemMinQuantity})
            `);

            const info = stmt.run();
            return info;
        },
        update: item => {
            const stmt = this.db.prepare(`
                UPDATE items
                SET ItemCode = '${item.itemCode}',
                    ItemName = '${item.itemName}',
                    ItemDescription = '${item.itemDescription}',
                    ItemQuantity = ${item.itemQuantity},
                    ItemMinQuantity = ${item.itemMinQuantity}
                WHERE ItemID = ${item.itemId}
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
    //expose fs
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
contextBridge.exposeInMainWorld(
    //expose electron dialog
    'dialog',
    {
        showErrorBox: content => {
            ipcRenderer.send('dialog', {type: 'showErrorBox', content});
        }
    }
);
contextBridge.exposeInMainWorld(
    //expose networks
    'network',
    {
        networkSearch: network.networkSearch
    }
);
contextBridge.exposeInMainWorld(
    //expose ws
    'ws',
    {
        httpServer: null,
        wss: null,
        clientWs: null,
        isOnline: () => {
            return this.httpServer?.listening;
        },
        host: (info, getAll) => {
            this.httpServer = http.createServer((req, res) => res.end(info));
            this.httpServer.on('error', error => {
                this.httpServer.close();
                ipcRenderer.send('dialog', {type: 'showErrorBox', content: error.toString()});
            });
            this.httpServer.listen(1210, network.getIpSubnet().ip, () => {
                this.wss = new WS.Server({
                    server: this.httpServer,
                    clientTracking: true
                });
                this.wss.on('error', error => {
                    ipcRenderer.send('dialog', {type: 'showErrorBox', content: error.toString()});
                });
                this.wss.on('close', () => this.httpServer.close());
                this.wss.on('connection', (ws, request) => {
                    ws.on('message', message => {
                        if (message.toString() === 'sync') {
                            getAll().forEach(item => {
                                ws.send(JSON.stringify(item));
                            });
                            ws.send('end');
                        }
                    });
                });
            });
        },
        closeServer: () => {
            this.wss.close();
            this.httpServer.close();
        },
        requestName: (address, callback) => {
            const req = http.request({hostname: address, port: 1210, method: 'GET'}, res => { //sends a request to the database for the database name
                res.on('data', callback);
            });
            req.on('error', error => {
                dialog.showErrorBox(`There was an error making a request: ${error}`);
            });
            req.end();
        },
        connect: ip => {
            return new Promise((resolve, reject) => {
                this.clientWs = new WS(`ws://${ip}:${1210}`);

                let timeout = setTimeout(() => {
                    this.clientWs.close();
                }, 10000); 
                this.clientWs.on('error', error => {
                    console.error(error);
                    ipcRenderer.send('dialog', {type: 'showErrorBox', content: 'Cannot connect to database'});
                    location.href = '../html/databases.html';
                });
                this.clientWs.on('close', () => {
                    location.href = '../html/databases.html';
                });
                this.clientWs.on('open', () => {
                    clearTimeout(timeout);
                    resolve();
                });
            });
        },
        initialise: callback => {
            this.clientWs.on('message', callback);
        },
        sync: () => {
            this.clientWs.send('sync');
        }
    }
);