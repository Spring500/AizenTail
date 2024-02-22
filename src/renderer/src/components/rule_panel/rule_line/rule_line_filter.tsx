import { RegexTextField, RuleLineWarpper } from "./wappers";

export const RuleLine_Filter = function ({ index, rules, setRules }: {
    index: number, rules: FilterConfig[],
    setRules: (rules: FilterConfig[]) => void,
}) {
    const rule = rules[index];
    const setRule = (index: number, rule: FilterConfig) => {
        setRules(rules.map((r, i) => i === index ? rule : r));
    }
    const switchRules = (index: number, newIndex: number) => {
        if (newIndex < 0 || newIndex >= rules.length
            || index < 0 || index >= rules.length) return;
        [rules[index], rules[newIndex]] = [rules[newIndex], rules[index]];
        setRules([...rules]);
    }
    const deleteRule = (index: number) => {
        rules.splice(index, 1);
        setRules([...rules]);
    }
    const renderReg = () => {
        return <div className="ruleBlock" title="根据输入的正则表达式匹配日志条目">
            <RegexTextField fieldName={`${rule.exclude ? "排除" : "包含"}匹配串`}
                value={rule.reg} placeholder="输入匹配串" regexEnable={rule.regexEnable}
                onChange={(value) => setRule(index, { ...rule, reg: value })}
                onEnter={(value) => setRule(index, { ...rule, reg: value })}
                onRegexEnableChange={(enable) => setRule(index, { ...rule, regexEnable: enable })} />
        </div>
    }

    const ruleUp = () => switchRules(index, index - 1);
    const ruleDown = () => switchRules(index, index + 1);
    const enableRule = () => setRule(index, { ...rule, enable: !rule.enable });
    const onRuleDelete = () => deleteRule(index);
    const toggleExclude = () => setRule(index, { ...rule, exclude: !rule.exclude });

    return <RuleLineWarpper key={index} index={index} enable={!!rule.enable} ruleCount={rules.length}
        onRuleDelete={onRuleDelete} onRuleDown={ruleDown} onRuleEnable={enableRule} onRuleUp={ruleUp}
        menuItems={[{ key: "exclude", name: () => rule.exclude ? "包含匹配串" : "排除匹配串", callback: toggleExclude }]}>
        {renderReg()}
        <div className="fixedRuleBlock">
            <button className={rule.exclude ? "ruleButton activatedButton" : "ruleButton"}
                onClick={toggleExclude} title="满足该条匹配规则的日志将被筛除还是保留">
                反向筛选</button>
        </div>
    </RuleLineWarpper >
}