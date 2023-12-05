import { contextBridge, ipcRenderer } from "electron";
contextBridge.exposeInMainWorld("electron", {
    openFile: (filename: string) => ipcRenderer.invoke("open-file", filename),
    watchFile: (filename: string) => ipcRenderer.send("watch-file", filename),
    setOnWatchFile: (callback: (event: Electron.IpcRendererEvent, text: string) => void) => ipcRenderer.on("watch-file-reply", callback),
    removeOnWatchFile: (callback: (event: Electron.IpcRendererEvent, text: string) => void) => ipcRenderer.removeListener("watch-file-reply", callback),
    unwatchFile: () => ipcRenderer.send("unwatch-file"),
});