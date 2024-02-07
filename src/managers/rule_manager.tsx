import { logManager } from "./log_manager";

type Rule = {
    reg: RegExp;
    exclude: boolean;
};

// TODO: 添加脏标记，只有在规则发生变化时才写入规则

class RuleManager {
    public colorRules: ColorConfig[] = [];
    private readonly colorRegExps: (RegExp | undefined)[] = [];
    public getColorRegExp(index: number): RegExp | undefined {
        const reg = this.colorRegExps[index];
        if (!reg) {
            try { this.colorRegExps[index] = new RegExp(this.colorRules[index].reg); }
            catch (e) { this.colorRegExps[index] = undefined; }
        }
        return this.colorRegExps[index];
    }
    public replaceRules: ReplaceConfig[] = [];
    private readonly replaceRegExps: (RegExp | undefined)[] = [];
    public getReplaceRegExp(index: number): RegExp | undefined {
        const reg = this.replaceRegExps[index];
        if (!reg) {
            try { this.replaceRegExps[index] = new RegExp(this.replaceRules[index].reg); }
            catch (e) { this.replaceRegExps[index] = undefined; }
        }
        return this.replaceRegExps[index];
    }
    public filterRules: FilterConfig[] = [];
    private readonly filterRegExps: (RegExp | undefined)[] = [];
    public getFilterRegExp(index: number): RegExp | undefined {
        const reg = this.filterRegExps[index];
        if (!reg) {
            try { this.filterRegExps[index] = new RegExp(this.filterRules[index].reg); }
            catch (e) { this.filterRegExps[index] = undefined; }
        }
        return this.filterRegExps[index];
    }

    public constructor() {
        this.openFile('setting.json');
    }

    async openFile(filepath: string) {
        console.log('打开文件', filepath);
        if (!filepath) return;

        const resultText = await (window as any).electron.openFile(filepath);
        if (resultText === null) return;
        await this.initSetting(resultText);
    }

    async saveFile(filepath: string) {
        console.log('保存文件', filepath);
        if (!filepath) return;
        await (window as any).electron.writeFile(filepath, this.stringify());
    }

    async initSetting(settingString: string) {
        this.colorRegExps.length = 0;
        this.replaceRegExps.length = 0;
        this.filterRegExps.length = 0;
        let setting: any = undefined;
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
        if (setting.color !== undefined) {
            for (let i = 0; i < setting.color.length; i++) {
                const rule = setting.color[i];
                this.colorRules.push({ reg: rule.reg, color: rule.color, index: i, background: rule.background, enable: rule.enable ?? true });
            }
        }

        if (setting.replacing !== undefined) {
            for (let i = 0; i < setting.replacing.length; i++) {
                const rule = setting.replacing[i];
                this.replaceRules.push({ reg: rule.reg, replace: rule.replace, index: i, enable: rule.enable ?? true });
            }
        }

        if (setting.filter !== undefined) {
            for (let i = 0; i < setting.filter.length; i++) {
                const rule = setting.filter[i];
                this.filterRules.push({ reg: rule.reg, exclude: rule.exclude, index: i, enable: rule.enable ?? true });
            }
        }
        this.refreshRules();
    }

    public stringify(): string {
        const setting = {
            color: this.colorRules.map(rule => ({ reg: rule.reg, color: rule.color, background: rule.background, enable: rule.enable })),
            replacing: this.replaceRules.map(rule => ({ reg: rule.reg, replace: rule.replace, enable: rule.enable })),
            filter: this.filterRules.map(rule => ({ reg: rule.reg, exclude: rule.exclude, enable: rule.enable })),
        };
        return JSON.stringify(setting, undefined, 4);
    }

    public saveConfig(): void {
        this.saveFile('setting.json');
    }

    public addRule(type: "color" | "filter" | "replace"): void {
        switch (type) {
            case "color":
                this.colorRules.push({ reg: "", color: "", index: this.colorRules.length, background: "", enable: true });
                break;
            case "filter":
                this.filterRules.push({ reg: "", exclude: false, index: this.filterRules.length });
                break;
            case "replace":
                this.replaceRules.push({ reg: "", replace: "", index: this.replaceRules.length });
                break;
        }
        this.refreshRules();
    }

    public removeRule(type: "color" | "filter" | "replace", index: number): void {
        const ruleArray = type === "color" ? this.colorRules : type === "filter" ? this.filterRules : this.replaceRules;
        ruleArray.splice(index, 1);
        this.refreshRules();
    }

    public clearRules(type: "color" | "filter" | "replace",): void {
        const ruleArray = type === "color" ? this.colorRules : type === "filter" ? this.filterRules : this.replaceRules;
        ruleArray.length = 0;
        this.refreshRules();
    }

    public switchRules(type: "color" | "filter" | "replace", index1: number, index2: number): void {
        const ruleArray = type === "color" ? this.colorRules : type === "filter" ? this.filterRules : this.replaceRules;
        if (index1 < 0 || index1 >= ruleArray.length || index2 < 0 || index2 >= ruleArray.length) return;
        const temp = ruleArray[index1];
        ruleArray[index1] = ruleArray[index2];
        ruleArray[index2] = temp;
        this.refreshRules();
    }

    public setEnable(type: "color" | "filter" | "replace", index: number, enable: boolean): void {
        const ruleArray = type === "color" ? this.colorRules : type === "filter" ? this.filterRules : this.replaceRules;
        const rule = ruleArray[index];
        if (!rule || rule.enable === enable) return;
        rule.enable = enable;
        this.refreshRules();
    }

    public setReg(type: "color" | "filter" | "replace", index: number, reg: string): void {
        const ruleArray = type === "color" ? this.colorRules : type === "filter" ? this.filterRules : this.replaceRules;
        const rule = ruleArray[index];
        if (!rule || rule.reg === reg) return;
        ruleArray[index].reg = reg;
        this.refreshRules();
    }

    public setRuleFontColor(index: number, color: string): void {
        const rule = this.colorRules[index];
        if (!rule || rule.color === color) return;
        rule.color = color;
        this.refreshRules();
    }

    public setRuleBackgroundColor(index: number, color: string): void {
        const rule = this.colorRules[index];
        if (!rule || rule.background === color) return;
        rule.background = color;
        this.refreshRules();
    }

    public setRuleReplace(index: number, replace: string): void {
        const rule = this.replaceRules[index];
        if (!rule || rule.replace === replace) return;
        rule.replace = replace;
        this.refreshRules();
    }

    refreshTimer: NodeJS.Timeout | null = null;
    public refreshRules(): void {
        if (this.refreshTimer !== null) {
            clearTimeout(this.refreshTimer);
        }
        for (let i = 0; i < this.colorRules.length; i++)
            this.colorRules[i].index = i;
        for (let i = 0; i < this.replaceRules.length; i++)
            this.replaceRules[i].index = i;
        for (let i = 0; i < this.filterRules.length; i++)
            this.filterRules[i].index = i;
        this.refreshTimer = setTimeout(() => {
            this.refreshTimer = null;
            this.colorRegExps.length = 0;
            this.replaceRegExps.length = 0;
            this.filterRegExps.length = 0;
            logManager.refreshFilter();
            this.onRuleChanged?.();
        }, 150);
        this.saveConfig(); // TODO:初始化的第一次刷新不需要保存
    }

    onRuleChanged: null | (() => void) = null;
}

export type IRuleManager = RuleManager;
export const ruleManager = new RuleManager();