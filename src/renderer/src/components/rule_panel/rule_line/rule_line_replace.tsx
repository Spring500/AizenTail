import React from 'react'
import { RuleContext, SettingContext } from '@renderer/context'
import { RuleTable } from '../rule_table'
import { ReplaceRegInput } from './rule_line_replace_reg'

export const ReplaceRulePanel: React.FC = function () {
    const ruleContext = React.useContext(RuleContext)
    const settingContext = React.useContext(SettingContext)
    const ruleSetKey = settingContext?.currentRuleSet ?? ''
    const datas =
        ruleContext?.rules?.[ruleSetKey]?.replaceRules?.map((rule, index) => {
            return { ...rule, key: index + '' }
        }) ?? []

    const enabledRules: number[] = []
    for (let index = 0; index < datas.length; index++)
        if (datas[index].enable) enabledRules.push(index)

    const onEnabledChanged = (newEnabledRules: number[]): void => {
        const newRules = { ...ruleContext?.rules }
        const ruleSet = newRules[ruleSetKey]
        ruleSet.replaceRules = ruleSet.replaceRules?.map((rule, index) => {
            return { ...rule, enable: newEnabledRules.includes(index) }
        })
        ruleContext?.resetRules(newRules)
    }

    return (
        <RuleTable
            tableName="替换规则"
            datas={datas}
            keyDesc={[
                {
                    key: 'reg',
                    title: '匹配串',
                    render: (text: string, _, index) => (
                        <ReplaceRegInput
                            value={text}
                            index={index}
                            title="根据输入的正则表达式匹配日志条目"
                        />
                    )
                },
                { type: 'checkbox', key: 'regexEnable', title: '正则', desc: '是否启用正则匹配' },
                {
                    type: 'input',
                    key: 'replace',
                    title: '替换串',
                    desc: '将根据正则表达式匹配得到的字符串替换显示为对应的字符串。用$1、$2...等分别表示与正则表达式中的第1、2...个子表达式相匹配的文本'
                }
            ]}
            selectedRowKeys={enabledRules}
            onSelectionChanged={onEnabledChanged}
            onAddRule={(rule) => ruleContext?.addReplace(ruleSetKey, rule)}
            onChangeRule={(index, rule) => ruleContext?.setReplace(ruleSetKey, index, rule)}
            onDeleteRule={(index) => ruleContext?.delReplace(ruleSetKey, index)}
            onInsertRule={(oldIndex, newIndex) =>
                ruleContext?.insertReplace(ruleSetKey, oldIndex, newIndex)
            }
        />
    )
}
