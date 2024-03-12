import { ColorPicker } from "antd";
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

export const RuleLine_Color = function ({ index, rules, setRules }: {
    index: number, rules: ColorConfig[],
    setRules: (rules: ColorConfig[]) => void,
}) {
    const rule = rules[index];
    const setRule = (index: number, rule: ColorConfig) => {
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
                regexEnable={rule.regexEnable} style={{ color: rule.color, backgroundColor: rule.background }}
                onChange={(text) => setRule(index, { ...rule, reg: text })}
                onEnter={(text) => setRule(index, { ...rule, reg: text })}
                onRegexEnableChange={(enable) => setRule(index, { ...rule, regexEnable: enable })}
            />
        </div>
    }

    const ColorField = function ({ value, style, onChange }: {
        value: string | undefined, style?: React.CSSProperties,
        onChange: (value: string | undefined) => void,
    }) {
        return <ColorPicker defaultValue={value} allowClear disabledAlpha arrow={false}
            style={{ ...style, backgroundColor: '#00000000', borderColor: "#ffffff20", }}
            onChangeComplete={color => { onChange(color.toRgb().a > 0 ? color.toHexString() : undefined) }}
            // showText={(color) => <span>Custom Text ({color.toHexString()})</span>}
            size='small'
        />
    }

    const renderBackColor = () => {
        return <div className="ruleBlock"
            title="满足匹配条件的日志将应用选取的背景色，可以填写xml格式颜色字符串"> 背景色
            <ColorField value={rule.background} onChange={(text) => setRule(index, { ...rule, background: text })} />
        </div>
    }

    const renderFontColor = () => {
        return <div className="ruleBlock"
            title="满足匹配条件的日志将应用选取的字体色，可以填写xml格式颜色字符串"> 字体色
            <ColorField value={rule.color} onChange={(text) => setRule(index, { ...rule, color: text })} />
        </div>
    }

    const onRuleUp = () => switchRules(index, index - 1);
    const onRuleDown = () => switchRules(index, index + 1);
    const onRuleEnable = () => setRule(index, { ...rule, enable: !rule.enable });
    const onRuleDelete = () => deleteRule(index);

    return <RuleLineWarpper key={index} index={index} enable={!!rule.enable} ruleCount={rules.length}
        onRuleDelete={onRuleDelete} onRuleDown={onRuleDown} onRuleEnable={onRuleEnable} onRuleUp={onRuleUp}>
        {renderReg()} {renderBackColor()} {renderFontColor()}
    </RuleLineWarpper>
}