import { contextBridge, ipcRenderer } from "electron";
contextBridge.exposeInMainWorld("electron", {
    readSettings: () => ipcRenderer.invoke("read-settings"),
    writeSettings: (settings: string) => ipcRenderer.invoke("write-settings", settings),
    openFile: (filename: string) => ipcRenderer.invoke("open-file", filename),
    watchFile: (filename: string) => ipcRenderer.send("watch-file", filename),
    watchLogChange: (callback: (event: Electron.IpcRendererEvent, type: "add" | "clear", text: string) => void) =>
        ipcRenderer.on("log-changed", callback),
    removeLogChange: (callback: (event: Electron.IpcRendererEvent, type: "add" | "clear", text: string) => void) =>
        ipcRenderer.removeListener("log-changed", callback),
    unwatchFile: () => ipcRenderer.send("unwatch-file"),
    openDevTools: () => ipcRenderer.send("open-dev-tools"),
    windowMinimize: () => ipcRenderer.send("window-minimize"),
    windowMaximize: () => ipcRenderer.send("window-maximize"),
    setAlwaysOnTop: (flag: boolean) => ipcRenderer.send("window-set-always-on-top", flag),
});