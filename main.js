const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

const Store = require('electron-store');
const store = new Store();


//remove the default menu for electron apps
Menu.setApplicationMenu(null);

function bootApp(){
    const win = new BrowserWindow({
        useContentSize: true,
        width: 800,
        height: 800,
        show: false,
        title: 'Inventory Tracker',
        webPreferences: {
            preload: path.join(__dirname, './renderer/js/preload.js')
        }
    });
    win.loadFile('./renderer/html/home.html');
    win.on('ready-to-show', () => win.show());

    ipcMain.on('store', (event, obj) => {
        switch (obj.type){
            case 'set':
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
    });
    ipcMain.on('fs', (event, obj) => {
        switch (obj.type){
            case 'readdir':
                fs.readdir(obj.path, obj.options, obj.callback);
                break;
        }
    });
    ipcMain.on('dialog', (event, obj) => {
        switch (obj.type){
            case 'showErrorBox':
                dialog.showErrorBox('Error', obj.content);
                break;
        }
    });
    ipcMain.handle('path', (event, arg) => {
        switch (arg){
            case 'userData':
                return app.getPath('userData');
        }
    });
}

ipcMain.handle('getVersion', () => {
    return app.getVersion();
});

app.whenReady().then(bootApp);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});