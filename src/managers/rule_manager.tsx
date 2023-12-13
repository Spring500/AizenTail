
type Rule = {
    reg: RegExp;
    exclude: boolean;
};

class RuleManager {
    private static instance: RuleManager;

    private rules: Rule[] = [];

    private constructor() { }

    public static getInstance(): RuleManager {
        if (!RuleManager.instance) {
            RuleManager.instance = new RuleManager();
        }

        return RuleManager.instance;
    }

    public getRules(): Rule[] {
        return this.rules;
    }

    public addRule(rule: Rule): void {
        this.rules.push(rule);
    }

    public removeRule(rule: Rule): void {
        this.rules = this.rules.filter((r) => r !== rule);
    }

    public clearRules(): void {
        this.rules = [];
    }

    public setHighlightLine(line: number): void {
        this.onSetHighlightLine?.(line);
    }



    onSetRuleCount: null | ((ruleCount: number) => void) = null;
    onSetHighlightLine: null | ((highlightLine: number) => void) = null;
    onScrollToItem: null | ((index: number) => void) = null;
}

export const ruleManager = RuleManager.getInstance();