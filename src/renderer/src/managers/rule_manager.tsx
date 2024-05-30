const SETTING_PATH = 'setting.json'
export type TSetting = {
    color: ColorConfig[]
    replacing: ReplaceConfig[]
}

// TODO: 添加脏标记，只有在规则发生变化时才写入规则

class RuleManager {
    async saveFile(filepath: string = SETTING_PATH, setting: TSetting): Promise<void> {
        console.log('保存文件', filepath)
        if (!filepath) return
        await window.electron.writeFile(filepath, JSON.stringify(setting, undefined, 4))
    }

    async reloadConfig(filepath: string = 'setting.json'): Promise<void> {
        const settingString = await window.electron.openFile(filepath)
        if (settingString === null) return
        let setting: TSetting | undefined = undefined
        try {
            console.log('initSetting file')
            setting = JSON.parse(settingString)
        } catch (e) {
            console.error('initSetting error', e)
        }
        setting = setting ?? { color: [], replacing: [] }
        this.dispatch('ruleChanged', {
            color: setting.color.map((rule) => ({ ...rule, enable: rule.enable ?? true })),
            replacing: setting.replacing.map((rule) => ({ ...rule, enable: rule.enable ?? true }))
        })
    }

    public saveConfig(setting: TSetting): void {
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
