const SETTING_PATH = 'setting.json'
export type TSetting = Record<
    string,
    {
        filterRules?: FilterConfig[]
        replaceRules?: ReplaceConfig[]
    }
>

// TODO: 添加脏标记，只有在规则发生变化时才写入规则

class RuleManager {
    async saveFile(filepath: string = SETTING_PATH, setting: TSetting | undefined): Promise<void> {
        console.log('保存文件', filepath)
        if (!setting) setting = { rules: {} }
        if (!filepath) return
        await window.electron.writeFile(filepath, JSON.stringify(setting, undefined, 4))
    }

    async reloadConfig(filepath: string = 'setting.json'): Promise<void> {
        const settingString = await window.electron.openFile(filepath)
        if (settingString === null) return
        let setting: TSetting | undefined = undefined
        try {
            console.log('规则初始化', filepath, settingString)
            setting = JSON.parse(settingString)
        } catch (e) {
            console.error('initSetting error', e)
        }
        setting = setting ?? { rules: {} }
        if (!setting.rules) setting.rules = {}
        if (Object.keys(setting.rules).length === 0) setting = { default: {} }
        console.log('规则初始化完毕', setting)
        this.dispatch('ruleChanged', setting)
    }

    public saveConfig(setting: TSetting | undefined): void {
        this.saveFile(SETTING_PATH, setting)
    }

    private callbacks = new Map<string, Set<(...args: any[]) => void>>()
    listen(event: 'ruleChanged', callback: (rules: TSetting) => void): void {
        if (!this.callbacks.has(event)) this.callbacks.set(event, new Set())
        this.callbacks.get(event)?.add(callback)
    }
    unlisten(event: 'ruleChanged', callback: (rules: TSetting) => void): void {
        this.callbacks.get(event)?.delete(callback)
    }
    dispatch(event: 'ruleChanged', rules: TSetting): void {
        this.callbacks.get(event)?.forEach((callback) => callback(rules))
    }
}

export type IRuleManager = RuleManager
export const ruleManager = new RuleManager()
