class LogManager {
    readonly logs = new Array<LogMeta>();
    isFiltering = false;
    autoScroll = true;
    filtedLogIds = new Array<number>();

    rules: LogConfig = { color: [], replacing: [], filter: [] };

    constructor() {
        console.log("LogManager constructor");
        this.init();
    }

    async init() {
        (window as any).electron.setOnWatchFile(this.updateFile);

        // 解析setting.json
        this.rules = await this.initSetting();
    }

    async initSetting() {
        let setting: any = undefined;
        try {
            const settingString = await (window as any).electron.readSettings();
            console.log("initSetting file", settingString);
            if (settingString !== null)
                setting = JSON.parse(settingString);
        } catch (e) {
            console.log("initSetting error", e);
        }
        setting = setting ?? { color: [], replacing: [], filter: [] };
        const rules: LogConfig = { color: [], replacing: [], filter: [] };
        for (const rule of setting.color ?? [])
            rules.color.push({ reg: new RegExp(rule.reg), background: rule.background, color: rule.color });

        for (const rule of setting.replacing ?? [])
            rules.replacing.push({ reg: new RegExp(rule.reg), replace: rule.replace });

        for (const rule of setting.filter ?? [])
            rules.filter.push({ reg: new RegExp(rule.reg), exclude: rule.exclude });
        console.log("initSetting", rules);
        return rules;
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
        (window as any).electron.unwatchFile();
        const resultText = await (window as any).electron.openFile(filename);
        if (resultText === null) return;
        (window as any).electron.watchFile(filename);
        this.logs.length = 0;
        await this.updateFile(null, resultText);
    }

    toggleFilter() {
        this.refreshFilter(!this.isFiltering);
    }

    toggleAutoScroll() {
        this.autoScroll = !this.autoScroll;
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