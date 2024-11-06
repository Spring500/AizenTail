import { contextBridge, ipcRenderer } from 'electron'
const api: CustomAPI = {
    openFileDialog: (title, defaultPath?, filters?) =>
        ipcRenderer.invoke('open-file-dialog', title, defaultPath, filters),

    openSaveDialog: (title, defaultPath?, filters?) =>
        ipcRenderer.invoke('open-save-dialog', title, defaultPath, filters),
    openFile: (filename) => ipcRenderer.invoke('open-file', filename),
    startWatchLog: (filename, content) => ipcRenderer.invoke('write-file', filename, content),
    watchFile: (filename) => ipcRenderer.send('watch-file', filename),
    watchLogChange: (callback) => ipcRenderer.on('log-changed', callback),
    removeLogChange: (callback) => ipcRenderer.removeListener('log-changed', callback),
    stopWatchLog: () => ipcRenderer.send('unwatch-file'),
    openDevTools: () => ipcRenderer.send('open-dev-tools'),
    windowMinimize: () => ipcRenderer.send('window-minimize'),
    windowMaximize: () => ipcRenderer.send('window-maximize'),
    setAlwaysOnTop: (flag) => ipcRenderer.send('window-set-always-on-top', flag)
}

if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld('electron', api)
    } catch (error) {
        console.error(error)
    }
} else {
    // @ts-ignore (define in dts)
    window.electron = api
}
