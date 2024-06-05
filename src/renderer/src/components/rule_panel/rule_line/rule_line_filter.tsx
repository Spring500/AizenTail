import React from 'react'
import { RuleContext, SettingContext } from '@renderer/App'
import { RuleTable } from './rule_line_table'
import { FilterRegInput } from './rule_line_filter_reg'

export const FilterRulePanel: React.FC = function () {
    const ruleContext = React.useContext(RuleContext)
    const settingContext = React.useContext(SettingContext)
    const ruleSetKey = settingContext?.currentRuleSet ?? ''
    const datas = ruleContext?.rules?.[ruleSetKey]?.filterRules ?? []
    const enabledRules: number[] = []
    for (let index = 0; index < datas.length; index++)
        if (datas[index].enable) enabledRules.push(index)

    const onEnabledChanged = (newEnabledRules: number[]): void => {
        const newRules = { ...ruleContext?.rules }
        const ruleSet = newRules[ruleSetKey]
        ruleSet.filterRules = ruleSet.filterRules?.map((rule, index) => {
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
                        <FilterRegInput value={text} index={index} />
                    )
                },
                { type: 'checkbox', key: 'regexEnable', title: '正则' },
                { type: 'checkbox', key: 'exclude', title: '反向' },
                { type: 'color', key: 'color', title: '字体色' },
                { type: 'color', key: 'background', title: '背景色' }
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
