import { contextBridge, ipcRenderer } from "electron";
const api = {
    openFileDialog: (title: string, defaultPath?: string, filters?: Electron.FileFilter[]) =>
        ipcRenderer.invoke("open-file-dialog", title, defaultPath, filters),

    openSaveDialog: (title: string, defaultPath?: string, filters?: Electron.FileFilter[]) =>
        ipcRenderer.invoke("open-save-dialog", title, defaultPath, filters),
    openFile: (filename: string) => ipcRenderer.invoke("open-file", filename),
    writeFile: (filename: string, content: string) => ipcRenderer.invoke("write-file", filename, content),
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
};

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