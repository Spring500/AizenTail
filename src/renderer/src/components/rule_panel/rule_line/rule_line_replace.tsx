import { EditorableTextField } from "../../common/text_field";
import { RegexTextField, RuleLineWarpper } from "./wappers";

const isObjectEqual = (a: object, b: object) => {
    for (let key in a) {
        if (a[key] !== b[key]) return false;
    }
    for (let key in b) {
        if (a[key] !== b[key]) return false;
    }
    return true;
}

export const RuleLine_Replace = function ({ index, rules, setRules }: {
    index: number, rules: ReplaceConfig[],
    setRules: (rules: ReplaceConfig[]) => void,
}) {
    const rule = rules[index];
    const setRule = (index: number, rule: ReplaceConfig) => {
        if (index < 0 || index >= rules.length) return;
        if (isObjectEqual(rules[index], rule)) return;
        setRules(rules.map((r, i) => i === index ? rule : r));
    }
    const switchRules = (index: number, newIndex: number) => {
        if (newIndex < 0 || newIndex >= rules.length
            || index < 0 || index >= rules.length) return;
        if (isObjectEqual(rules[index], rules[newIndex])) return;
        [rules[index], rules[newIndex]] = [rules[newIndex], rules[index]];
        setRules([...rules]);
    }
    const deleteRule = (index: number) => {
        if (index < 0 || index >= rules.length) return;
        rules.splice(index, 1);
        setRules([...rules]);
    }
    const renderReg = () => {
        return <div className="ruleBlock" title="根据输入的正则表达式匹配日志条目">
            <RegexTextField fieldName="匹配串" value={rule.reg} placeholder="输入匹配串"
                regexEnable={rule.regexEnable}
                onChange={(value) => setRule(index, { ...rule, reg: value })}
                onEnter={(value) => setRule(index, { ...rule, reg: value })}
                onRegexEnableChange={(enable) => setRule(index, { ...rule, regexEnable: enable })} />
        </div>
    }

    const renderReplace = () => {
        const title = "将根据正则表达式匹配得到的字符串替换显示为对应的字符串。用$1、$2...等分别表示与正则表达式中的第1、2...个子表达式相匹配的文本";
        return <div className="ruleBlock" title={title}> 替换串
            <EditorableTextField value={rule.replace} placeholder="替换"
                onChange={(value) => setRule(index, { ...rule, replace: value })}
                onEnter={(value) => setRule(index, { ...rule, replace: value })} />
        </div>
    }

    const ruleUp = () => switchRules(index, index - 1);
    const ruleDown = () => switchRules(index, index + 1);
    const enableRule = () => setRule(index, { ...rule, enable: !rule.enable });
    const onRuleDelete = () => deleteRule(index);

    return <RuleLineWarpper key={index} index={index} enable={!!rule.enable} ruleCount={rules.length}
        onRuleDelete={onRuleDelete} onRuleDown={ruleDown} onRuleEnable={enableRule} onRuleUp={ruleUp}>
        {renderReg()} {renderReplace()}
    </RuleLineWarpper>
}