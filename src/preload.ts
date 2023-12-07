import { contextBridge, ipcRenderer } from "electron";
contextBridge.exposeInMainWorld("electron", {
    readSettings: () => ipcRenderer.invoke("read-settings"),
    openFile: (filename: string) => ipcRenderer.invoke("open-file", filename),
    watchFile: (filename: string) => ipcRenderer.send("watch-file", filename),
    setOnWatchFile: (callback: (event: Electron.IpcRendererEvent, text: string) => void) => ipcRenderer.on("watch-file-reply", callback),
    removeOnWatchFile: (callback: (event: Electron.IpcRendererEvent, text: string) => void) => ipcRenderer.removeListener("watch-file-reply", callback),
    unwatchFile: () => ipcRenderer.send("unwatch-file"),
    openDevTools: () => ipcRenderer.send("open-dev-tools"),
    windowMinimize: () => ipcRenderer.send("window-minimize"),
    windowMaximize: () => ipcRenderer.send("window-maximize"),
    setAlwaysOnTop: (flag: boolean) => ipcRenderer.send("window-set-always-on-top", flag),
});