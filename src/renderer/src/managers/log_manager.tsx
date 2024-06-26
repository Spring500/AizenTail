type LogMeta = {
    /**该行日志在文件中的起始偏移量 */
    offset: number
    /**日志是第几行 */
    index: number
    /**后续去除对text的直接存储 */
    text: string
    /**测试结果缓存 */
    testResult: Map<number, boolean>
}

const RULE_CACHE_MAX = 5
const RULE_CACHE_MIN = 2

// TODO：已经计算好的日志行号和日志行号对应的索引，可以直接使用，不需要每次都计算
class LogManager {
    readonly logs = new Array<LogMeta>()
    filtedLogIds = new Array<number>()
    /**当开启筛选时，获取显示行数对应的日志行 */ lineToIndexMap = new Map<number, number>()

    constructor() {
        console.log('LogManager constructor')
        window.electron.watchLogChange(this.updateFile)
    }

    /**获取日志行号 */
    public indexToLine(index: number): number {
        return this.isFiltering()
            ? this.filtedLogIds[index] ?? -1
            : index <= this.logs.length - 1
              ? index
              : -1
    }

    public lineToIndex(line: number): number {
        return this.isFiltering() ? this.lineToIndexMap.get(line) ?? -1 : line
    }

    /**获取正则替换后的日志文本 */
    public getLogText(index: number): string {
        index = this.isFiltering() ? this.filtedLogIds[index] : index
        const text = this.logs[index]?.text ?? ''
        return text
    }

    async openFile(filepath: string): Promise<void> {
        console.log('打开文件', filepath)
        if (!filepath) return
        const start = Date.now()

        window.electron.unwatchFile()
        const resultText = await window.electron.openFile(filepath)
        if (resultText === null) return
        window.electron.watchFile(filepath)
        this.logs.length = 0
        await this.updateFile(null, 'add', resultText)
        this.onSetHint?.(`打开文件耗时：${Date.now() - start}ms`)
    }

    clear(): void {
        this.logs.length = 0
        this.refreshFilter()
    }

    hasFilter(): boolean {
        return (
            this.inputFilters.length > 0 || this.GetCurrentFilterRules().some((rule) => rule.enable)
        )
    }

    private disableFilter: boolean = false
    setFilterDisabled(flag: boolean): void {
        this.disableFilter = flag
        this.refreshFilter()
    }

    isFiltering(): boolean {
        return this.hasFilter() && !this.disableFilter
    }

    inputFilters = new Array<string>()
    setInputFilter(filter: string): void {
        filter = filter.trim()
        if (filter === '') this.inputFilters.length = 0
        else this.inputFilters = filter.split(/\s+/)
        this.refreshFilter()
    }

    public GetCurrentFilterRules(): FilterConfig[] {
        return this.filterRules ?? []
    }

    updateCache: { data: string; type: 'add' | 'replace' } | undefined = undefined
    public updateFile = async (_: unknown, type: 'add' | 'clear', data: string): Promise<void> => {
        if (type === 'add') {
            if (!this.updateCache) this.updateCache = { data, type }
            else {
                this.updateCache.data += data
            }
        } else if (type === 'clear') {
            this.updateCache = { data: '', type: 'replace' }
        }
    }

    public refreshFile = async (): Promise<void> => {
        if (this.updateCache === undefined) {
            return
        }
        if (this.logs.length <= 0)
            this.logs.push({ offset: 0, index: 0, text: '', testResult: new Map() })
        if (this.updateCache.type === 'add') {
            let data = this.updateCache.data
            if (data.length <= 0) return

            let count = this.logs.length
            let lineEnded = false
            if (data[data.length - 1] === '\n') {
                lineEnded = true
                data = data.substring(0, data.length - 1)
            }
            const newLogs = data.split('\n')
            const lastLog = this.logs[this.logs.length - 1]
            lastLog.text += newLogs[0]
            lastLog.testResult.clear()

            for (let i = 1; i < newLogs.length; i++) {
                this.logs.push({
                    offset: 0,
                    index: count++,
                    text: newLogs[i],
                    testResult: new Map()
                })
            }
            if (lineEnded)
                this.logs.push({ offset: 0, index: count++, text: '', testResult: new Map() })
        } else if (this.updateCache.type === 'replace') {
            this.logs.length = 0
            const data = this.updateCache.data
            if (data.length > 0) {
                const newLogs = data.split('\n')
                for (let i = 0; i < newLogs.length; i++) {
                    this.logs.push({ offset: 0, index: i, text: newLogs[i], testResult: new Map() })
                }
            }
        }
        this.updateCache = undefined
        this.refreshFilter()
    }

    lastRefreshTime = 0
    refreshTimer: NodeJS.Timeout | null = null
    public refreshFilter(): void {
        // 每100ms最多触发一次, 防止频繁刷新
        if (Date.now() - this.lastRefreshTime < 100) {
            this.refreshTimer && clearTimeout(this.refreshTimer)
            this.refreshTimer = setTimeout(this.refreshFilter.bind(this), 100)
            return
        }
        this.lastRefreshTime = Date.now()

        const invalidRuleKeys: string[] = []
        // 检查并去除无效的正则表达式
        for (const rulePair of this.ruleIndexMap.entries()) {
            if (
                !this.GetCurrentFilterRules().some(
                    (rule) => this.getRuleIndex(rule) === rulePair[1]
                ) &&
                !this.inputFilters.some((pattern) => this.getPatternIndex(pattern) === rulePair[1])
            ) {
                invalidRuleKeys.push(rulePair[0])
            }
        }
        if (invalidRuleKeys.length >= RULE_CACHE_MAX) {
            const trashCount = invalidRuleKeys.length
            const removeCount = trashCount - RULE_CACHE_MIN
            const removeKeyList: string[] = []
            // 根据lru删除部分无效的rule
            for (const ruleId of this.ruleIdLru) {
                const ruleKey = [...this.ruleIndexMap].find(([, id]) => id === ruleId)?.[0]
                if (ruleKey === undefined || !invalidRuleKeys.some((key) => key === ruleKey))
                    continue
                removeKeyList.push(ruleKey)
                if (removeKeyList.length >= removeCount) break
            }
            this.removeRuleCaches(removeKeyList)
        }

        this.filtedLogIds.length = 0
        this.lineToIndexMap.clear()
        const rules = this.GetCurrentFilterRules().map((rule) => ({
            ...rule,
            ruleId: this.getRuleIndex(rule)
        }))
        const patterns = this.inputFilters.map((pattern) => ({
            pattern,
            patternId: this.getPatternIndex(pattern)
        }))
        if (this.hasFilter()) {
            for (let line = 0; line < this.logs.length; line++) {
                if (this.calculateExcluded(line, rules, patterns)) continue
                const index = this.filtedLogIds.length
                this.lineToIndexMap.set(line, index)
                this.filtedLogIds.push(line)
            }
            console.log(`过滤耗时 ${Date.now() - this.lastRefreshTime}ms`)
        }
        this.onSetLogCount?.(
            this.isFiltering() ? this.filtedLogIds.length + 1 : logManager.logs.length + 1
        )
    }

    private filterRules: FilterConfig[] = []
    setFilterRules(rules: FilterConfig[] | undefined): void {
        this.filterRules = rules ?? []
        this.refreshFilter()
    }
    private ruleIndexMap = new Map<string, number>()
    private ruleIndexMax = 0
    private ruleIdLru = new Set<number>()
    private readonly regCache: (RegExp | undefined | null)[] = []

    private removeRuleCaches(ruleKeys: string[]): void {
        if (ruleKeys.length <= 0) return
        const ruleIds: number[] = []
        for (const key of ruleKeys) {
            const ruleId = this.ruleIndexMap.get(key)
            if (ruleId === undefined) {
                console.warn(`ruleId not found for key: ${key}`)
                continue
            }
            ruleIds.push(ruleId)
            this.ruleIndexMap.delete(key)
            this.regCache[ruleId] = undefined
            this.ruleIdLru.delete(ruleId)
        }
        for (const log of this.logs) {
            for (const ruleId of ruleIds) {
                log.testResult.delete(ruleId)
            }
        }
    }

    private keyToIndex(key: string): number {
        let index = this.ruleIndexMap.get(key)
        if (index === undefined) {
            index = this.ruleIndexMax++
            this.regCache[index] = null
            this.ruleIndexMap.set(key, index)
        }
        this.ruleIdLru.delete(index)
        this.ruleIdLru.add(index)
        return index
    }

    private getRuleIndex(rule: FilterConfig): number {
        return this.keyToIndex(this.ruleToKey(rule))
    }

    private getPatternIndex(pattern: string): number {
        return this.keyToIndex(this.patternToKey(pattern))
    }

    private ruleToKey(rule: FilterConfig): string {
        return `r_${rule.reg}_${!!rule.regexEnable}`
    }

    private patternToKey(pattern: string): string {
        return `p_${pattern}`
    }

    private getRuleReg(rule: FilterConfig): RegExp | null | undefined {
        const ruleId = this.getRuleIndex(rule)
        const regExp = this.regCache[ruleId]
        if (regExp === null) {
            try {
                this.regCache[ruleId] = new RegExp(rule.reg ?? '')
            } catch (e) {
                this.regCache[ruleId] = undefined
            }
        }
        return this.regCache[ruleId]
    }

    private getPatternReg(pattern: string): RegExp | null | undefined {
        const ruleId = this.keyToIndex(this.patternToKey(pattern))
        const regExp = this.regCache[ruleId]
        if (regExp === null) {
            try {
                this.regCache[ruleId] = new RegExp(
                    `(${pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
                    'i'
                )
            } catch (e) {
                this.regCache[ruleId] = undefined
            }
        }
        return this.regCache[ruleId]
    }

    private testRule(rule: FilterConfig & { ruleId: number }, log: LogMeta): boolean {
        const ruleId = rule.ruleId
        let result = log.testResult.get(ruleId)
        if (result !== undefined) return result
        if (rule.regexEnable) {
            result = !!this.getRuleReg(rule)?.test(log.text)
        } else {
            result = log.text.includes(rule.reg ?? '')
        }
        log.testResult.set(ruleId, result)
        return result
    }

    private testPattern(pattern: { pattern: string; patternId: number }, log: LogMeta): boolean {
        let result = log.testResult.get(pattern.patternId)
        if (result !== undefined) return result
        result = !!this.getPatternReg(pattern.pattern)?.test(log.text)
        log.testResult.set(pattern.patternId, result)
        return result
    }

    private calculateExcluded(
        line: number,
        rules: (FilterConfig & { ruleId: number })[],
        patterns: { pattern: string; patternId: number }[]
    ): boolean {
        const log = this.logs[line]
        let include = false
        let hasIncludeFilter = false
        for (const rule of rules) {
            if (!rule.enable) continue
            if (!rule.exclude) hasIncludeFilter = true
            if (!this.testRule(rule, log)) {
                continue
            }
            if (rule.exclude) return true
            include = true
        }
        if (!include && hasIncludeFilter) return true
        if (patterns.length <= 0) return false
        return !patterns.some((pattern) => this.testPattern(pattern, log))
    }

    onSetHint: ((hint: string) => void) | null = null
    onSetLogCount: ((count: number) => void) | null = null
}
export type ILogManager = LogManager
export const logManager = new LogManager()
;(window as any).logManager = logManager
