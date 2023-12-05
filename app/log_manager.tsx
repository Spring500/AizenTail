import { ipcRenderer } from "electron";

class LogManager {
    readonly logs = new Array<LogMeta>();
    isFiltering = false;
    filtedLogIds = new Array<number>();

    rules = {
        color: [
            {
                color: 'red',
                reg: /error/i,
            },
            {
                background: 'green',
                reg: /Wwise/i,
            },
            {
                color: 'yellow',
                reg: /warn/i,
            }
        ],
        replacing: [
            {
                reg: /^\[(\d+.\d+.\d+-(\d+)\.(\d+)\.(\d+):(\d+))\]\[\s*(\d+)\]/,
                replace: '[$2:$3:$4.$5($6帧)]',
            },
            {
                reg: /\[GameThread\].*\[(信息|警告|错误)\]/,
                replace: '[$1]',
            },
            {
                reg: /\[(信息|警告|错误)\]\[(\w+)\](\[[^\[\]]+\])*/,
                replace: '[$1][$2]',
            },
            {
                reg: /D:\\aki\\Source\\Client/,
                replace: ' ..项目路径',
            },
            {
                reg: /Puerts: \(0x[0-9a-fA-F]+\)?/,
                replace: '',
            },
        ],
        filter: [
            {
                reg: /buff/,
                exclude: false,
            },
        ]
    };

    constructor() {
        console.log("LogManager constructor");
        this.init();
    }

    init() {
        window.electron.setOnWatchFile(this.updateFile);
    }

    getLogLine(index: number) {
        if (this.isFiltering) {
            const logId = this.filtedLogIds[index];
            return this.logs[logId] ?? '';
        }
        return this.logs[index] ?? '';
    }

    getLogColor(log: string): { background?: string, color?: string } {
        for (const rule of this.rules.color) {
            if (rule.reg.test(log)) return rule;
        };
        return {};
    }

    getLogReplacing(log: string) {
        for (const rule of this.rules.replacing) {
            if (rule.reg.test(log))
                log = log.replace(rule.reg, rule.replace);
        };
        return log;
    }

    async openFile(filename: string) {
        window.electron.unwatchFile();
        const resultText = await window.electron.openFile(filename);
        if (resultText === null) return;
        window.electron.watchFile(filename);
        this.logs.length = 0;
        await this.updateFile(null, resultText);
    }

    toggleFilter() {
        this.refreshFilter(!this.isFiltering);
    }

    updateFile = async (event: Electron.IpcRendererEvent | null, data: string) => {
        if (data[data.length - 1] === '\n') data = data.slice(0, data.length - 1);
        const result = data.split('\n');
        for (let i = 0; i < result.length; i++) {
            this.logs.push({ offset: 0, index: i, text: result[i], });
        }
        this.refreshFilter(this.isFiltering);
    }

    protected refreshFilter(isFiltering: boolean) {
        if (isFiltering) {
            this.filtedLogIds.length = 0;
            for (let i = 0; i < this.logs.length; i++) {
                const log = this.logs[i];
                let exclude = false;
                let include = false;
                for (const rule of this.rules.filter) {
                    if (rule.reg.test(log.text)) {
                        rule.exclude ? exclude = true : include = true;
                        break;
                    }
                }
                if (include && !exclude) {
                    this.filtedLogIds.push(i);
                }
            }
        }

        this.isFiltering = isFiltering;
        this.onRefreshFilter?.(isFiltering);
    }

    onRefreshFilter: ((filting: boolean) => void) | null = null;
}

export let logManager = new LogManager();