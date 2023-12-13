class LogManager {
    readonly logs = new Array<LogMeta>();
    _isFilteringSettings = false;
    autoScroll = true;
    alwaysOnTop = false;
    filtedLogIds = new Array<number>();
    /**当开启筛选时，获取显示行数对应的日志行 */
    lineToIndexMap = new Map<number, number>();

    rules: LogConfig = { color: [], replacing: [], filter: [] };

    constructor() {
        console.log("LogManager constructor");
        this.init();
    }

    async init() {
        (window as any).electron.watchLogChange(this.updateFile);

        document.onkeyup = (e) => {
            switch (e.key) {
                case 'f': if (e.altKey) this.toggleFilterSetting(); break;
                case 'r': if (e.altKey) this.toggleAutoScroll(); break;
                case 't': if (e.altKey) this.setAlwaysOnTop(!this.alwaysOnTop); break;
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

    /**获取日志行号 */
    public indexToLine(index: number): number {
        return this.isFiltering
            ? (this.filtedLogIds[index] ?? -1)
            : (index <= this.logs.length - 1 ? index : -1);
    }

    public lineToIndex(line: number) {
        return this.isFiltering ? (this.lineToIndexMap.get(line) ?? -1) : line;
    }

    /**获取正则替换后的日志文本 */
    public getLogText(index: number) {
        index = this.isFiltering ? this.filtedLogIds[index] : index;
        let text = this.logs[index]?.text ?? "";
        for (const rule of this.rules.replacing) {
            text = text.replace(rule.reg, rule.replace);
        }
        return text;
    }

    public getLogColor(log: string): { background?: string, color?: string } {
        for (const rule of this.rules.color) {
            if (rule.reg.test(log)) return rule;
        };
        return {};
    }

    async openFile(file: File) {
        const filepath = file.path;
        console.log('打开文件', filepath);
        if (!filepath) return;

        this.onSetHint?.(`正在打开文件...`);
        const start = Date.now();

        (window as any).electron.unwatchFile();
        const resultText = await (window as any).electron.openFile(filepath);
        if (resultText === null) return;
        (window as any).electron.watchFile(filepath);
        this.logs.length = 0;
        await this.updateFile(null, 'add', resultText);

        this.onSetFileUrl?.(filepath);
        this.onSetHint?.(`打开文件耗时：${Date.now() - start}ms`);
    }

    toggleFilterSetting() {
        this._isFilteringSettings = !this._isFilteringSettings;
        this.refreshFilter();
        this.onSetFiltering?.(this._isFilteringSettings);
        setTimeout(() => {
            if (this.highlightLine !== -1) {
                const index = this.lineToIndex(this.highlightLine);
                console.log("highlightLine", index, this.highlightLine);
                if (index !== -1) this.onScrollToItem?.(index)
            }
        }, 0);
    }

    toggleAutoScroll() {
        this.autoScroll = !this.autoScroll;
        this.onSetAutoScroll?.(this.autoScroll);
    }

    setAlwaysOnTop(flag: boolean) {
        this.alwaysOnTop = flag;
        (window as any).electron.setAlwaysOnTop(flag);
        this.onSetAlwaysOnTop?.(flag);
    }

    get isFiltering() {
        return this._isFilteringSettings || this.inputFilters.length > 0;
    }
    inputFilters = new Array<string>();
    setInputFilter(filter: string) {
        filter = filter.trim();
        if (filter === '') this.inputFilters.length = 0;
        else this.inputFilters = filter.split(/\s+/);
        this.refreshFilter();
    }

    public updateFile = async (event: Electron.IpcRendererEvent | null, type: 'add' | 'clear', data: string) => {
        if (this.logs.length <= 0)
            this.logs.push({ offset: 0, index: 0, text: '' });

        if (type === 'add') {
            let count = this.logs.length;
            let lineEnded = false;
            if (data[data.length - 1] === '\n') {
                lineEnded = true;
                data = data.substring(0, data.length - 1);
            }
            const newLogs = data.split('\n');
            this.logs[this.logs.length - 1].text += newLogs[0];
            for (let i = 1; i < newLogs.length; i++) {
                this.logs.push({ offset: 0, index: count++, text: newLogs[i] })
            }

            if (lineEnded) this.logs.push({ offset: 0, index: count++, text: '' });
        } else if (type === 'clear') {
            this.logs.length = 0;
        }

        this.refreshFilter();
        if (this.autoScroll) setTimeout(() => {
            if (this.highlightLine !== -1) {
                const index = this.lineToIndex(this.highlightLine);
                console.log("highlightLine", index, this.highlightLine);
                if (index !== -1) this.onScrollToItem?.(index)
            } else {
                this.onScrollToItem?.(this.isFiltering ? this.filtedLogIds.length - 1 : this.logs.length - 1);
            }
        }, 0);
    }

    lastRefreshTime = 0;
    refreshTimer: NodeJS.Timeout | null = null;
    protected refreshFilter() {
        console.log('刷新过滤', this._isFilteringSettings, this.inputFilters);
        // 每100ms最多触发一次, 防止频繁刷新
        if (Date.now() - this.lastRefreshTime < 100) {
            this.refreshTimer && clearTimeout(this.refreshTimer);
            this.refreshTimer = setTimeout(this.refreshFilter.bind(this), 100);
            return;
        }
        this.lastRefreshTime = Date.now();

        if (this.isFiltering) {
            this.filtedLogIds.length = 0;
            this.lineToIndexMap.clear();
            for (let line = 0; line < this.logs.length; line++) {
                const log = this.logs[line];
                let exclude = false;
                let include = false;
                for (const rule of this.rules.filter) {
                    if (rule.reg.test(log.text)) {
                        rule.exclude ? exclude = true : include = true;
                        break;
                    }
                }
                if (this.inputFilters?.some(filter => log.text.includes(filter))) {
                    include = true;
                }
                if (include && !exclude) {
                    this.lineToIndexMap.set(line, this.filtedLogIds.length);
                    this.filtedLogIds.push(line);
                }
            }
            this.onSetHint?.(`过滤耗时 ${Date.now() - this.lastRefreshTime}ms`);
            this.onSetLogCount?.(this.filtedLogIds.length + 1);
        } else {
            this.onSetHint?.(`关闭过滤`);
            this.onSetLogCount?.(logManager.logs.length + 1);
        }

        setTimeout(() => {
            if (this.highlightLine !== -1) {
                const index = this.lineToIndex(this.highlightLine);
                if (index !== -1) this.onScrollToItem?.(index)
            }
        }, 0);
    }

    highlightLine = -1;
    setHighlightLine(line: number) {
        this.highlightLine = line;
        this.onSetHighlightLine?.(line);
    }

    onSetHighlightLine: ((line: number) => void) | null = null;
    onSetFileUrl: ((fileUrl: string) => void) | null = null;
    onSetHint: ((hint: string) => void) | null = null;
    onSetLogCount: ((count: number) => void) | null = null;
    onScrollToItem: ((index: number) => void) | null = null;
    onSetAutoScroll: ((autoScroll: boolean) => void) | null = null;
    onSetFiltering: ((isFiltering: boolean) => void) | null = null;
    onSetAlwaysOnTop: ((alwaysOnTop: boolean) => void) | null = null;
}

export let logManager = new LogManager();

(window as any).logManager = logManager;