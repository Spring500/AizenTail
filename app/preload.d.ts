export declare global {
    interface Window {
        electron: {
            openFile: (filename: string) => Promise<string | null>,
            watchFile: (filename: string) => void,
            setOnWatchFile: (callback: (event: Electron.IpcRendererEvent, text: string) => void) => void,
            removeOnWatchFile: (callback: (event: Electron.IpcRendererEvent, text: string) => void) => void,
            unwatchFile: () => void,
        }
    }
}