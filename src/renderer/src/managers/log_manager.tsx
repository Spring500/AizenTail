class LogManager {
    readonly logs = new Array<LogMeta>();
    autoScroll = true;
    alwaysOnTop = false;
    filtedLogIds = new Array<number>();
    /**当开启筛选时，获取显示行数对应的日志行 */ lineToIndexMap = new Map<number, number>();

    constructor() {
        console.log("LogManager constructor");
        window.electron.watchLogChange(this.updateFile);
    }

    /**获取日志行号 */
    public indexToLine(index: number): number {
        return this.isFiltering()
            ? (this.filtedLogIds[index] ?? -1)
            : (index <= this.logs.length - 1 ? index : -1);
    }

    public lineToIndex(line: number) {
        return this.isFiltering() ? (this.lineToIndexMap.get(line) ?? -1) : line;
    }

    /**获取正则替换后的日志文本 */
    public getLogText(index: number) {
        index = this.isFiltering() ? this.filtedLogIds[index] : index;
        let text = this.logs[index]?.text ?? "";
        return text;
    }

    async openFile(filepath: string) {
        console.log('打开文件', filepath);
        if (!filepath) return;

        this.onSetHint?.(`正在打开文件...`);
        const start = Date.now();

        window.electron.unwatchFile();
        const resultText = await window.electron.openFile(filepath);
        if (resultText === null) return;
        window.electron.watchFile(filepath);
        this.logs.length = 0;
        await this.updateFile(null, 'add', resultText);
        this.onSetHint?.(`打开文件耗时：${Date.now() - start}ms`);
    }

    clear() {
        this.logs.length = 0;
        this.refreshFilter();
    }

    hasFilter() {
        return this.inputFilters.length > 0 || this.filterRules.some(rule => rule.enable);
    }

    private disableFilter: boolean = false;
    setFilterDisabled(flag: boolean) {
        this.disableFilter = flag;
        this.refreshFilter();
    }

    isFiltering() {
        return this.hasFilter() && !this.disableFilter;
    }

    inputFilters = new Array<string>();
    setInputFilter(filter: string) {
        filter = filter.trim();
        if (filter === '') this.inputFilters.length = 0;
        else this.inputFilters = filter.split(/\s+/);
        this.refreshFilter();
    }

    public updateFile = async (_: any, type: 'add' | 'clear', data: string) => {
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
    }

    lastRefreshTime = 0;
    refreshTimer: NodeJS.Timeout | null = null;
    public refreshFilter() {
        // 每100ms最多触发一次, 防止频繁刷新
        if (Date.now() - this.lastRefreshTime < 100) {
            this.refreshTimer && clearTimeout(this.refreshTimer);
            this.refreshTimer = setTimeout(this.refreshFilter.bind(this), 100);
            return;
        }
        this.lastRefreshTime = Date.now();

        this.filtedLogIds.length = 0;
        this.lineToIndexMap.clear();
        if (this.hasFilter()) {
            for (let line = 0; line < this.logs.length; line++) {
                if (this.calculateExcluded(line)) continue;
                const index = this.filtedLogIds.length;
                this.lineToIndexMap.set(line, index);
                this.filtedLogIds.push(line);
            }
            this.onSetHint?.(`过滤耗时 ${Date.now() - this.lastRefreshTime}ms`);
        }
        this.onSetLogCount?.(this.isFiltering() ? this.filtedLogIds.length + 1 : logManager.logs.length + 1);
    }

    private filterRules: FilterConfig[] = [];
    setFilterRules(rules: FilterConfig[]) {
        this.filterRules = rules;
        this.filterRegExps.length = 0;
        this.refreshFilter();
    }
    private readonly filterRegExps: (RegExp | undefined)[] = [];
    public getFilterRegExp(index: number): RegExp | undefined {
        const reg = this.filterRegExps[index];
        if (!reg) {
            try { this.filterRegExps[index] = new RegExp(this.filterRules[index].reg); }
            catch (e) { this.filterRegExps[index] = undefined; }
        } else reg.lastIndex = 0;
        return this.filterRegExps[index];
    }

    private calculateExcluded(line: number): boolean {
        const text = this.logs[line].text;
        let include = false;
        let hasIncludeFilter = false;
        for (const [index, rule] of this.filterRules.entries()) {
            if (!rule.enable) continue;
            if (!rule.exclude) hasIncludeFilter = true;
            if (rule.regexEnable) {
                if (!this.getFilterRegExp(index)?.test(text)) continue;
            } else {
                if (!text.includes(rule.reg)) continue;
            }
            if (rule.exclude) return true;
            include = true;
        }
        if (!include && hasIncludeFilter) return true;
        if (this.inputFilters.length <= 0) return false;
        return !this.inputFilters?.some(filter => text.match(new RegExp(`(${filter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, "gi")));
    }

    onSetHint: ((hint: string) => void) | null = null;
    onSetLogCount: ((count: number) => void) | null = null;
}
export type ILogManager = LogManager;
export let logManager = new LogManager();

(window as any).logManager = logManager;