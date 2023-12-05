import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';
import watch from 'node-watch';

let watcher: fs.FSWatcher | null = null;
let fileCurrentSize = 0;

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800, height: 600,
        minWidth: 700, minHeight: 200,
        alwaysOnTop: true,
        autoHideMenuBar: true,
        frame: false,
        movable: true,
        webPreferences: {
            preload: path.resolve(__dirname, 'preload.js'),
        }
    });
    win.loadFile('./app/index.html');
    win.webContents.openDevTools({ mode: 'detach' });
}

app.whenReady().then(() => {
    ipcMain.handle('open-file', async (event, filename) => {
        console.log('loading', filename);
        const promise = new Promise<string | null>((resolve, reject) => {
            fs.readFile(filename, (err, data) => {
                if (err) {
                    console.error('load failed', err, filename);
                    return resolve(null);
                }
                return resolve(data.toString());
            });
        });
        return await promise;
    });
    ipcMain.on('watch-file', (event, filename) => {
        watcher?.close();
        console.log('watching file', filename);
        fileCurrentSize = fs.statSync(filename).size;
        watcher = watch(filename, { recursive: false, delay: 200 }, (evt, name) => {
            console.log('watching file changed', evt, name);
            if (evt !== "update") {
                return;
            }
            const fd = fs.openSync(filename, 'r');
            const buffer = Buffer.alloc(fs.statSync(filename).size - fileCurrentSize);
            fs.readSync(fd, buffer, 0, buffer.length, fileCurrentSize);
            fs.closeSync(fd);
            fileCurrentSize = fs.statSync(filename).size;
            event.reply('watch-file-reply', buffer.toString());
        });
    });
    ipcMain.on('unwatch-file', () => {
        watcher?.close();
        watcher = null;
        fileCurrentSize = 0;
    });
    createWindow();
});
