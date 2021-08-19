const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');

//remove the default menu for electron apps
Menu.setApplicationMenu(null);

function bootApp(){
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        title: 'Inventory Tracker',
        webPreferences: {
            preload: path.join(__dirname, './renderer/js/preload.js')
        }
    });

    win.loadFile('./renderer/html/index.html');
    win.webContents.openDevTools();
}

ipcMain.handle('getVersion', () => {
    return app.getVersion();
});

app.whenReady().then(bootApp);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});