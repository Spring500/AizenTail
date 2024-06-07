import React from 'react'
import { RuleContext, SettingContext } from '@renderer/context'
import { RuleTable } from '../rule_table'
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
            tableName="过滤规则"
            datas={datas}
            keyDesc={[
                {
                    key: 'reg',
                    title: '匹配串',
                    render: (text: string, _, index) => (
                        <FilterRegInput
                            value={text}
                            index={index}
                            title="根据输入的正则表达式匹配日志条目"
                        />
                    )
                },
                { type: 'checkbox', key: 'regexEnable', title: '正则', desc: '是否启用正则匹配' },
                {
                    type: 'checkbox',
                    key: 'exclude',
                    title: '反向',
                    desc: '是否启用反向匹配，当启用时只有不满足匹配串的日志条目会被显示'
                },
                {
                    type: 'color',
                    key: 'color',
                    disabled: (record) => !!record.exclude,
                    title: '字体色',
                    desc: '设置匹配到的日志条目的字体颜色'
                },
                {
                    type: 'color',
                    key: 'background',
                    disabled: (record) => !!record.exclude,
                    title: '背景色',
                    desc: '设置匹配到的日志条目的背景颜色'
                }
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
