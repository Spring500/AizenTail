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

        document.onkeyup = (e) => {
            switch (e.key) {
                case 'f': this.toggleFilter(); break;
                case 'r': this.toggleAutoScroll(); break;
                case 'F12': (window as any).electron.openDevTools(); break;
            }
        }

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
            else
                console.log("initSetting file is null");
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

    public getLogLine(index: number) {
        if (this.isFiltering) {
            const logId = this.filtedLogIds[index];
            return this.logs[logId].text ?? '';
        }
        return this.logs[index].text ?? '';
    }
    public getLogReplacing(log: string) {
        for (const rule of this.rules.replacing) {
            if (rule.reg.test(log))
                log = log.replace(rule.reg, rule.replace);
        };
        return log;
    }

    /**获取正则替换后的日志文本 */
    public getReplacedLogLine(index: number) {
        return this.getLogReplacing(this.getLogLine(index));
    }

    public getLogColor(log: string): { background?: string, color?: string } {
        for (const rule of this.rules.color) {
            if (rule.reg.test(log)) return rule;
        };
        return {};
    }

    async openFile(file: File) {
        const filepath = file.path;
        console.log('打开文件', event);
        if (!filepath) return;

        this.onSetHint?.(`正在打开文件...`);
        const start = Date.now();

        (window as any).electron.unwatchFile();
        const resultText = await (window as any).electron.openFile(filepath);
        if (resultText === null) return;
        (window as any).electron.watchFile(filepath);
        this.logs.length = 0;
        await this.updateFile(null, resultText);

        this.onSetFileUrl?.(filepath);
        this.onSetHint?.(`打开文件耗时：${Date.now() - start}ms`);
    }

    toggleFilter() {
        this.refreshFilter(!this.isFiltering);
        this.onSetFiltering?.(this.isFiltering);
    }

    toggleAutoScroll() {
        this.autoScroll = !this.autoScroll;
        this.onSetAutoScroll?.(this.autoScroll);
    }

    public updateFile = async (event: Electron.IpcRendererEvent | null, data: string) => {
        if (data[data.length - 1] === '\n') data = data.slice(0, data.length - 1);
        const result = data.split('\n');
        for (let i = 0; i < result.length; i++) {
            this.logs.push({ offset: 0, index: i, text: result[i], });
        }
        this.refreshFilter(this.isFiltering);
    }

    protected refreshFilter(isFiltering: boolean) {
        console.log('刷新过滤', isFiltering);
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

        if (isFiltering) {
            this.onSetHint?.(`开启过滤`);
            this.onSetLogCount?.(this.filtedLogIds.length);
            if (logManager.autoScroll)
                setTimeout(() => this.onScrollToItem?.(logManager.filtedLogIds.length - 1), 0);
        } else {
            this.onSetHint?.(`关闭过滤`);
            this.onSetLogCount?.(logManager.logs.length);
            if (logManager.autoScroll)
                setTimeout(() => this.onScrollToItem?.(logManager.logs.length - 1), 0);
        }
    }

    onSetFileUrl: ((fileUrl: string) => void) | null = null;
    onSetHint: ((hint: string) => void) | null = null;
    onSetLogCount: ((count: number) => void) | null = null;
    onScrollToItem: ((index: number) => void) | null = null;
    onSetAutoScroll: ((autoScroll: boolean) => void) | null = null;
    onSetFiltering: ((isFiltering: boolean) => void) | null = null;
}

export let logManager = new LogManager();