const SETTING_PATH = 'setting.json'
export type TRules = Record<
    string,
    {
        filterRules?: FilterConfig[]
        replaceRules?: ReplaceConfig[]
    }
>

export type TSettings = {
    rules?: TRules
    isAlwaysOnTop?: boolean
    isShowHoverText?: boolean
    isFiltering?: boolean
    isAutoScroll?: boolean
    currentRuleSet?: string
    colorTheme?: 'light' | 'dark'
    isCompactMode?: boolean
}

// TODO: 添加脏标记，只有在规则发生变化时才写入规则

class RuleManager {
    async saveFile(filepath: string = SETTING_PATH, setting: TSettings | undefined): Promise<void> {
        if (!filepath) return
        await window.electron.writeFile(filepath, JSON.stringify(setting ?? {}, undefined, 4))
    }

    async reloadConfig(filepath: string = 'setting.json'): Promise<TSettings | undefined> {
        const settingString = await window.electron.openFile(filepath)
        if (settingString === null) return undefined
        let setting: TSettings | undefined = undefined
        try {
            setting = JSON.parse(settingString)
        } catch (e) {
            console.error('initSetting error', e)
        }
        setting = setting ?? {}
        return setting
    }

    public saveConfig(setting: TSettings | undefined): void {
        this.saveFile(SETTING_PATH, setting)
    }
}

export type IRuleManager = RuleManager
export const ruleManager = new RuleManager()
