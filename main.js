const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');

const Store = require('electron-store');
const store = new Store();


//remove the default menu for electron apps
Menu.setApplicationMenu(null);

function bootApp(){
    const win = new BrowserWindow({
        useContentSize: true,
        width: 800,
        height: 600,
        show: false,
        title: 'Inventory Tracker',
        webPreferences: {
            preload: path.join(__dirname, './renderer/js/preload.js')
        }
    });

    win.loadFile('./renderer/html/index.html');

    win.on('ready-to-show', () => win.show());
    win.webContents.openDevTools();

    ipcMain.on('store', (event, obj) => {
        switch (obj.type){
            case 'set':
                console.log(obj.obj);
                store.set(obj.obj);
                break;
            case 'clearAll':
                store.clear();
                break;
            case 'delete':
                store.delete(obj.key);
                break;
            case 'get':
                event.returnValue = store.get(obj.key);
                break;
            case 'getAll':
                event.returnValue = store.store;
                break;
        }
    })
}

ipcMain.handle('getVersion', () => {
    return app.getVersion();
});

app.whenReady().then(bootApp);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});