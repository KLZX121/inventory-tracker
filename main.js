const { app, BrowserWindow, Menu } = require('electron');

Menu.setApplicationMenu(null);

function bootApp(){
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        title: 'Inventory Tracker',
        webPreferences: {
            nodeIntegration: true
        }
    });

    win.loadFile('./renderer/index.html');
    win.webContents.openDevTools();
}

app.whenReady().then(bootApp);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});