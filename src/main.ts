import { app, BrowserWindow } from 'electron';

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800, height: 600,
        minWidth: 700, minHeight: 200,
        alwaysOnTop: true,
        autoHideMenuBar: true,
        frame: false,
        movable: true,
    });
    win.loadFile('./app/index.html');
    win.webContents.openDevTools({ mode: 'detach' });
}

app.whenReady().then(() => {
    createWindow()
});
