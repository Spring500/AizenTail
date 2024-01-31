import { ruleManager } from "./rule_manager";

class LogManager {
    readonly logs = new Array<LogMeta>();
    autoScroll = true;
    alwaysOnTop = false;
    filtedLogIds = new Array<number>();
    /**当开启筛选时，获取显示行数对应的日志行 */ lineToIndexMap = new Map<number, number>();

    rules: LogConfig = { colorRules: [], replaceRules: [], filterRules: [] };

    constructor() {
        console.log("LogManager constructor");
        this.init();
    }

    async init() {
        (window as any).electron.watchLogChange(this.updateFile);

        document.onkeyup = (e) => {
            switch (e.key) {
                case 'r': if (e.altKey) this.toggleAutoScroll(); return;
                case 'h': if (e.ctrlKey) this.setFilterDisabled(!this.disableFilter); return;
                case 't': if (e.altKey) this.setAlwaysOnTop(!this.alwaysOnTop); return;
                case 'F12': (window as any).electron.openDevTools(); break;
            }
            this.handleHotKey(e.key, e.altKey, e.ctrlKey, e.shiftKey);
        }

        // 解析setting.json
        this.rules = ruleManager;
    }

    private hotKeyMap = new Map<string, () => unknown>();

    /**注册热键 */
    public registerHotKey(
        key: string, altKey: boolean, ctrlKey: boolean, shiftKey: boolean, callback: () => unknown
    ) {
        this.hotKeyMap.set(
            `${key}_${altKey ? 'alt' : ''}_${ctrlKey ? 'ctrl' : ''}_${shiftKey ? 'shift' : ''}`
            , callback);
    }

    /**处理热键 */
    public handleHotKey(key: string, altKey: boolean, ctrlKey: boolean, shiftKey: boolean) {
        const callback = this.hotKeyMap.get(
            `${key}_${altKey ? 'alt' : ''}_${ctrlKey ? 'ctrl' : ''}_${shiftKey ? 'shift' : ''}`
        );
        console.log('handleHotKey', key, altKey, ctrlKey, shiftKey, callback);
        if (callback) callback();
    }

    /**移除热键 */
    public unregisterHotKey(key: string, altKey: boolean, ctrlKey: boolean, shiftKey: boolean) {
        this.hotKeyMap.delete(
            `${key}_${altKey ? 'alt' : ''}_${ctrlKey ? 'ctrl' : ''}_${shiftKey ? 'shift' : ''}`
        );
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
        for (const rule of this.rules.replaceRules) {
            if (!rule.enable) continue;
            const reg = ruleManager.getReplaceRegExp(rule.index);
            if (reg) text = text.replace(reg, rule.replace);
        }
        return text;
    }

    public getLogColor(log: string): { background?: string, color?: string } {
        for (const rule of this.rules.colorRules) {
            if (!rule.enable) continue;
            const reg = ruleManager.getColorRegExp(rule.index);
            if (reg?.test(log)) return rule;
        };
        return {};
    }

    async openFile(filepath: string) {
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

    clear() {
        this.logs.length = 0;
        this.refreshFilter();
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

    hasFilter() {
        return this.inputFilters.length > 0 || this.rules.filterRules.some(rule => rule.enable);
    }

    private disableFilter: boolean = false;
    setFilterDisabled(flag: boolean) {
        this.disableFilter = flag;
        this.refreshFilter();
    }

    isDisableFilter() {
        return this.disableFilter;
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
                this.onScrollToItem?.(this.isFiltering()
                    ? this.filtedLogIds.length - 1
                    : this.logs.length - 1);
            }
        }, 0);
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
                this.filtedLogIds.push(line);
                this.lineToIndexMap.set(line, this.filtedLogIds.length);
            }
            this.onSetHint?.(`过滤耗时 ${Date.now() - this.lastRefreshTime}ms`);
        }
        this.onSetLogCount?.(this.isFiltering() ? this.filtedLogIds.length + 1 : logManager.logs.length + 1);

        setTimeout(() => {
            if (this.highlightLine !== -1) {
                const index = this.lineToIndex(this.highlightLine);
                if (index !== -1) this.onScrollToItem?.(index)
            }
        }, 0);
    }

    private calculateExcluded(line: number): boolean {
        const text = this.logs[line].text;
        let include = false;
        let hasIncludeFilter = false;
        for (const rule of this.rules.filterRules) {
            if (!rule.enable) continue;
            if (!rule.exclude) hasIncludeFilter = true;
            if (!ruleManager.getFilterRegExp(rule.index)?.test(text)) continue;
            if (rule.exclude) return true;
            include = true;
        }
        if (!include && hasIncludeFilter) return true;
        if (this.inputFilters.length <= 0) return false;
        return !this.inputFilters?.some(filter => text.match(new RegExp(`(${filter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, "gi")));
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
    onSetAlwaysOnTop: ((alwaysOnTop: boolean) => void) | null = null;
}
export type ILogManager = LogManager;
export let logManager = new LogManager();

(window as any).logManager = logManager;