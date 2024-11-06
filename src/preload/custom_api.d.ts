type CustomAPI = {
    openFileDialog: (
        title: string,
        defaultPath?: string,
        filters?: Electron.FileFilter[]
    ) => Promise<string>
    openSaveDialog: (
        title: string,
        defaultPath?: string,
        filters?: Electron.FileFilter[]
    ) => Promise<string>
    openFile: (filename: string) => Promise<string | null>
    writeFile: (filename: string, content: string) => Promise<void>
    startWatchLog: (filename: string) => void
    watchLogChange: (
        callback: (event: Electron.IpcRendererEvent, type: 'add' | 'clear', text: string) => void
    ) => void
    removeLogChange: (
        callback: (event: Electron.IpcRendererEvent, type: 'add' | 'clear', text: string) => void
    ) => void
    stopWatchLog: () => void
    openDevTools: () => void
    windowMinimize: () => void
    windowMaximize: () => void
    setAlwaysOnTop: (flag: boolean) => void
}
