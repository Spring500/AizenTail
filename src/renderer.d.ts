export declare global {
    interface Window {
        electron: {
            openFile: (filename: string) => Promise<string | null>,
            watchFile: (filename: string) => void,
            watchLogChange: (callback: (event: Electron.IpcRendererEvent, text: string) => void) => void,
            removeLogChange: (callback: (event: Electron.IpcRendererEvent, text: string) => void) => void,
            unwatchFile: () => void,
        }
    }
}