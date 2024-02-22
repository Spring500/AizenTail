const SETTING_PATH = 'setting.json';
export type TSetting = {
    color: ColorConfig[],
    replacing: ReplaceConfig[],
    filter: FilterConfig[]
};

// TODO: 添加脏标记，只有在规则发生变化时才写入规则

class RuleManager {

    public constructor() {
        this.reloadSetting();
    }

    async openFile(filepath: string) {
        console.log('打开文件', filepath);
        await this.reloadSetting(filepath);
    }

    async saveFile(filepath: string = SETTING_PATH, setting: TSetting) {
        console.log('保存文件', filepath);
        if (!filepath) return;
        await window.electron.writeFile(filepath, JSON.stringify(setting, undefined, 4));
    }

    async reloadSetting(filepath: string = 'setting.json') {
        const settingString = await window.electron.openFile(filepath);
        if (settingString === null) return;
        let setting: TSetting | undefined = undefined;
        try {
            console.log("initSetting file");
            if (settingString !== null)
                setting = JSON.parse(settingString);
            else
                console.log("initSetting file is null");
        } catch (e) {
            console.error("initSetting error", e);
        }
        setting = setting ?? { color: [], replacing: [], filter: [] };
        const color: ColorConfig[] = setting.color.map((rule: any, index: number) => ({ ...rule, index, enable: rule.enable ?? true }));
        const replacing: ReplaceConfig[] = setting.replacing.map((rule: any, index: number) => ({ ...rule, index, enable: rule.enable ?? true }));
        const filter: FilterConfig[] = setting.filter.map((rule: any, index: number) => ({ ...rule, index, enable: rule.enable ?? true }));

        this.dispatch("ruleChanged", { color, replacing, filter });
    }

    public saveConfig(setting: TSetting): void {
        this.saveFile(SETTING_PATH, setting);
    }

    onRuleChanged: null | (() => void) = null;
    onReplaceRuleChanged: null | (() => void) = null;

    private eventCallbacks = new Map<string, Set<(...args: any[]) => void>>();
    listen(event: "ruleChanged", callback: (rules: TSetting) => void): void {
        if (!this.eventCallbacks.has(event)) this.eventCallbacks.set(event, new Set());
        this.eventCallbacks.get(event)?.add(callback);
    }
    unlisten(event: "ruleChanged", callback: (rules: TSetting) => void): void {
        this.eventCallbacks.get(event)?.delete(callback);
    }
    dispatch(event: "ruleChanged", rules: TSetting): void {
        this.eventCallbacks.get(event)?.forEach(callback => callback(rules));
    }
}

export type IRuleManager = RuleManager;
export const ruleManager = new RuleManager();