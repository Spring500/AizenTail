import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import { join } from 'path'
import { is } from '@electron-toolkit/utils'

import fs from 'fs';
import watch from 'node-watch';

let watcher: fs.FSWatcher | null = null;
let fileCurrentSize = 0;

const createWindow = () => {
    const mainWindow = new BrowserWindow({
        width: 800, height: 600,
        minWidth: 700, minHeight: 200,
        autoHideMenuBar: true,
        frame: false,
        movable: true,
        webPreferences: {
            preload: join(__dirname, '../preload/index.js'),
            sandbox: false
          }
    });
    // HMR for renderer base on electron-vite cli.
    // Load the remote URL for development or the local html file for production.
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
        mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    }
}

app.on('window-all-closed', () => {
    watcher?.close();
    app.quit();
});

app.whenReady().then(() => {
    ipcMain.handle('open-file-dialog', async (_, title: string, defaultPath?: string, filters?: Electron.FileFilter[]) => {
        console.log('opening file dialog', defaultPath);
        const window = BrowserWindow.getFocusedWindow();
        if (!window) {
            console.error('no focused window');
            return null;
        }
        const path = await dialog.showOpenDialog(window, { title, filters, defaultPath, properties: ['openFile'] })
            .then((result) => {
                if (result.canceled) {
                    console.log('open file dialog canceled');
                    return null;
                }
                console.log('!!!open file dialog selected', result.filePaths[0]);
                return result.filePaths[0];
            });
        return path;
    });

    ipcMain.handle('open-save-dialog', async (_, title: string, defaultPath?: string, filters?: Electron.FileFilter[]) => {
        console.log('opening save dialog', defaultPath);
        const window = BrowserWindow.getFocusedWindow();
        if (!window) {
            console.error('no focused window');
            return null;
        }
        const path = await dialog.showSaveDialog(window, { title, filters, defaultPath })
            .then((result) => {
                if (result.canceled) {
                    console.log('open save dialog canceled');
                    return null;
                }
                console.log('!!!open save dialog selected', result.filePath);
                return result.filePath;
            });
        if (!path) return null;
        return path;
    });
    ipcMain.handle('open-file', async (_, filename: string) => {
        console.log('open-file', filename);
        const promise = new Promise<string | null>((resolve) => {
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

    ipcMain.handle('write-file', async (_, filename: string, content: string) => {
        console.log('write-file', filename);
        return await new Promise<boolean>((resolve) => {
            fs.writeFile(filename, content, (err) => {
                if (err) {
                    console.error('write settings failed', err);
                    return resolve(false);
                }
                return resolve(true);
            });
        });
    });

    ipcMain.on('watch-file', (event, filename) => {
        watcher?.close();
        console.log('watching file', filename);
        fileCurrentSize = fs.statSync(filename).size;
        watcher = watch(filename, { recursive: false, delay: 200 }, (evt, _) => {
            switch (evt) {
                case "update": {
                    const fd = fs.openSync(filename, 'r');
                    let deltaSize = fs.statSync(filename).size - fileCurrentSize;

                    if (deltaSize < 0) {
                        event.reply('log-changed', 'clear', '');
                        fileCurrentSize = 0;
                        deltaSize = fs.statSync(filename).size;
                    }

                    if (deltaSize > 0) {
                        const buffer = Buffer.alloc(fs.statSync(filename).size - fileCurrentSize);
                        fs.readSync(fd, buffer, 0, buffer.length, fileCurrentSize);
                        fs.closeSync(fd);
                        fileCurrentSize = fs.statSync(filename).size;
                        event.reply('log-changed', 'add', buffer.toString());
                    }
                    break;
                }
                case "remove":
                    event.reply('log-changed', 'clear', '');
                    return;
                default:
                    return;
            }
        });
    });
    ipcMain.on('unwatch-file', () => {
        watcher?.close();
        watcher = null;
        fileCurrentSize = 0;
    });
    ipcMain.on('open-dev-tools', () => {
        BrowserWindow.getFocusedWindow()?.webContents.openDevTools({ mode: 'detach' });
    });
    ipcMain.on('window-minimize', () => {
        BrowserWindow.getFocusedWindow()?.minimize();
    });
    ipcMain.on('window-maximize', () => {
        const window = BrowserWindow.getFocusedWindow();
        if (window?.isMaximized()) {
            window.unmaximize();
        } else {
            window?.maximize();
        }
    });
    ipcMain.on('window-set-always-on-top', (_, flag: boolean) => {
        const window = BrowserWindow.getFocusedWindow();
        window?.setAlwaysOnTop(flag, 'main-menu');
    });
    createWindow();
});
