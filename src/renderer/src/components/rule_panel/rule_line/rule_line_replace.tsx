import { Input } from 'antd'
import { RegexTextField, RuleLineWarpper } from './wappers'
import React from 'react'

const isObjectEqual = (a: object, b: object): boolean => {
    for (const key in a) {
        if (a[key] !== b[key]) return false
    }
    for (const key in b) {
        if (a[key] !== b[key]) return false
    }
    return true
}

export const RuleLine_Replace: React.FC<{
    index: number
    rules: ReplaceConfig[]
    setRules: (rules: ReplaceConfig[]) => void
}> = function ({ index, rules, setRules }) {
    const rule = rules[index]
    const setRule = (index: number, rule: ReplaceConfig): void => {
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
                    onChange={(value) => setRule(index, { ...rule, reg: value })}
                    onRegexEnableChange={(enable) =>
                        setRule(index, { ...rule, regexEnable: enable })
                    }
                />
            </div>
        )
    }

    const renderReplace = (): React.ReactNode => {
        const title =
            '将根据正则表达式匹配得到的字符串替换显示为对应的字符串。用$1、$2...等分别表示与正则表达式中的第1、2...个子表达式相匹配的文本'
        return (
            <div className="ruleBlock" title={title}>
                <Input
                    addonBefore={'替换串'}
                    value={rule.replace}
                    spellCheck={false}
                    placeholder={'替换字符串'}
                    title={title}
                    onChange={(value): void =>
                        setRule(index, { ...rule, replace: value.target.value })
                    }
                    variant="filled"
                    size="small"
                />
            </div>
        )
    }

    const ruleUp = (): void => switchRules(index, index - 1)
    const ruleDown = (): void => switchRules(index, index + 1)
    const enableRule = (): void => setRule(index, { ...rule, enable: !rule.enable })
    const onRuleDelete = (): void => deleteRule(index)

    return (
        <RuleLineWarpper
            key={index}
            index={index}
            enable={!!rule.enable}
            ruleCount={rules.length}
            onRuleDelete={onRuleDelete}
            onRuleDown={ruleDown}
            onRuleEnable={enableRule}
            onRuleUp={ruleUp}
        >
            {renderReg()} {renderReplace()}
        </RuleLineWarpper>
    )
}
