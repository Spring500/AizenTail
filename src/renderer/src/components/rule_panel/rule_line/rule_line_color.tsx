import React from 'react'
import { ColorRuleTextField, RegexTextField, RuleLineWarpper } from './wappers'

const isObjectEqual = (a: object, b: object): boolean => {
    for (const key in a) {
        if (a[key] !== b[key]) return false
    }
    for (const key in b) {
        if (a[key] !== b[key]) return false
    }
    return true
}

export const RuleLine_Color: React.FC<{
    index: number
    rules: ColorConfig[]
    setRules: (rules: ColorConfig[]) => void
}> = function ({ index, rules, setRules }) {
    const rule = rules[index]
    const setRule = (index: number, rule: ColorConfig): void => {
        if (index < 0 || index >= rules.length) return
        if (isObjectEqual(rules[index], rule)) return
        setRules(rules.map((r, i) => (i === index ? rule : r)))
    }
    const switchRules = (index: number, newIndex: number): void => {
        if (newIndex < 0 || newIndex >= rules.length || index < 0 || index >= rules.length) return
        if (isObjectEqual(rules[index], rules[newIndex])) return
        ;[rules[index], rules[newIndex]] = [rules[newIndex], rules[index]]
        setRules([...rules])
    }
    const deleteRule = (index: number): void => {
        if (index < 0 || index >= rules.length) return
        rules.splice(index, 1)
        setRules([...rules])
    }

    const renderReg = (): React.ReactNode => {
        return (
            <div className="ruleBlock" title="根据输入的正则表达式匹配日志条目">
                <RegexTextField
                    fieldName="匹配串"
                    value={rule.reg}
                    placeholder="输入匹配串"
                    regexEnable={rule.regexEnable}
                    style={{ color: rule.color, backgroundColor: rule.background }}
                    onChange={(text) => setRule(index, { ...rule, reg: text })}
                    onEnter={(text) => setRule(index, { ...rule, reg: text })}
                    onRegexEnableChange={(enable) =>
                        setRule(index, { ...rule, regexEnable: enable })
                    }
                />
            </div>
        )
    }

    const renderBackColor = (): React.ReactNode => {
        return (
            <div
                className="ruleBlock colorRuleBlock"
                title="满足匹配条件的日志将应用选取的背景色，可以填写xml格式颜色字符串"
            >
                背景色
                <ColorRuleTextField
                    placeholder="选择背景色"
                    value={rule.background}
                    onChange={(text) => setRule(index, { ...rule, background: text })}
                    onEnter={(text) => setRule(index, { ...rule, background: text })}
                />
            </div>
        )
    }

    const renderFontColor = (): React.ReactNode => {
        return (
            <div
                className="ruleBlock colorRuleBlock"
                title="满足匹配条件的日志将应用选取的字体色，可以填写xml格式颜色字符串"
            >
                字体色
                <ColorRuleTextField
                    placeholder="选择字体色"
                    value={rule.color}
                    onChange={(text) => setRule(index, { ...rule, color: text })}
                    onEnter={(text) => setRule(index, { ...rule, color: text })}
                />
            </div>
        )
    }

    const onRuleUp = (): void => switchRules(index, index - 1)
    const onRuleDown = (): void => switchRules(index, index + 1)
    const onRuleEnable = (): void => setRule(index, { ...rule, enable: !rule.enable })
    const onRuleDelete = (): void => deleteRule(index)

    return (
        <RuleLineWarpper
            key={index}
            index={index}
            enable={!!rule.enable}
            ruleCount={rules.length}
            onRuleDelete={onRuleDelete}
            onRuleDown={onRuleDown}
            onRuleEnable={onRuleEnable}
            onRuleUp={onRuleUp}
        >
            {renderReg()} {renderBackColor()} {renderFontColor()}
        </RuleLineWarpper>
    )
}
