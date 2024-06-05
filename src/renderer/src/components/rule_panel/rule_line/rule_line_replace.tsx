import React from 'react'
import { RuleContext, SettingContext } from '@renderer/App'
import { RuleTable } from './rule_line_table'
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
            datas={datas}
            keyDesc={[
                {
                    key: 'reg',
                    title: '匹配串',
                    render: (text: string, _, index) => (
                        <ReplaceRegInput value={text} index={index} />
                    )
                },
                { type: 'checkbox', key: 'regexEnable', title: '正则' },
                { type: 'input', key: 'replace', title: '替换串' }
            ]}
            selectedRowKeys={enabledRules}
            onSelectionChanged={onEnabledChanged}
            onAddRule={(rule) => ruleContext?.addFilter(ruleSetKey, rule)}
            onChangeRule={(index, rule) => ruleContext?.setFilter(ruleSetKey, index, rule)}
            onDeleteRule={(index) => ruleContext?.delFilter(ruleSetKey, index)}
            onInsertRule={(oldIndex, newIndex) =>
                ruleContext?.insertFilter(ruleSetKey, oldIndex, newIndex)
            }
        />
    )
}
