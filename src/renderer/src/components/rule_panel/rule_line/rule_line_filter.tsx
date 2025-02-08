import React from 'react'
import { RuleContext, SettingContext } from '@renderer/context'
import { RuleTable } from '../rule_table'
import { RegExInput } from './regex_input'
import { Select } from 'antd'

export const FilterRulePanel: React.FC = function () {
    const { ruleSets, addFilter, setFilter, delFilter, insertFilter, resetRules } =
        React.useContext(RuleContext)
    const { currentRuleSet } = React.useContext(SettingContext)
    const ruleSetKey = currentRuleSet ?? ''
    const datas = ruleSets?.[ruleSetKey]?.filterRules ?? []
    const enabledRules: number[] = []
    for (let index = 0; index < datas.length; index++)
        if (datas[index].enable) enabledRules.push(index)

    const onEnabledChanged = (newEnabledRules: number[]): void => {
        const newRules = { ...ruleSets }
        const ruleSet = newRules[ruleSetKey]
        ruleSet.filterRules = ruleSet.filterRules?.map((rule, index) => {
            return { ...rule, enable: newEnabledRules.includes(index) }
        })
        resetRules(newRules)
    }

    return (
        <RuleTable
            tableName="过滤规则"
            datas={datas}
            keyDesc={[
                {
                    key: 'reg',
                    title: '匹配串',
                    render: (text: string, rule, index) => (
                        <RegExInput
                            value={text}
                            regexEnable={rule.regexEnable}
                            style={
                                rule.dyeing
                                    ? { color: rule.color, backgroundColor: rule.background }
                                    : undefined
                            }
                            title="根据输入的正则表达式匹配日志条目"
                            onChange={(reg) => setFilter(ruleSetKey, index, { ...rule, reg })}
                        />
                    )
                },
                { type: 'checkbox', key: 'regexEnable', title: '正则', desc: '是否启用正则匹配' },
                {
                    type: 'checkbox',
                    key: 'filterType',
                    title: '模式',
                    render: (_, record, index): React.ReactNode => {
                        const isDyeing = record.dyeing
                        const filterType = record.filterType
                        let mode = '仅染色'
                        if (filterType === 'EXCLUDE') {
                            mode = '排除'
                        } else {
                            if (isDyeing) {
                                if (filterType === 'INCLUDE') mode = '筛选+染色'
                                else mode = '仅染色'
                            } else {
                                if (filterType === 'INCLUDE') mode = '仅筛选'
                                else mode = '禁用'
                            }
                        }
                        const optionLabels = ['仅染色', '仅筛选', '筛选+染色', '排除', '禁用']

                        return (
                            <Select
                                style={{ width: '100%' }}
                                size="small"
                                options={optionLabels.map((label) => {
                                    return { label, value: label }
                                })}
                                optionRender={(option) => <span>{option.label}</span>}
                                value={mode}
                                onChange={(value) => {
                                    let dyeing = false
                                    let filterType: 'INCLUDE' | 'EXCLUDE' | undefined = undefined
                                    switch (value) {
                                        case '仅染色':
                                            ;[dyeing, filterType] = [true, undefined]
                                            break
                                        case '仅筛选':
                                            ;[dyeing, filterType] = [false, 'INCLUDE']
                                            break
                                        case '筛选+染色':
                                            ;[dyeing, filterType] = [true, 'INCLUDE']
                                            break
                                        case '排除':
                                            ;[dyeing, filterType] = [false, 'EXCLUDE']
                                            break
                                        default:
                                        case '禁用':
                                            ;[dyeing, filterType] = [false, undefined]
                                            break
                                    }
                                    setFilter(ruleSetKey, index, { ...record, dyeing, filterType })
                                }}
                            ></Select>
                        )
                    }
                    // desc: '是否只对匹配到的日志条目进行染色，不进行日志条目筛选'
                },
                {
                    type: 'color',
                    key: 'color',
                    disabled: (record) => !record.dyeing && record.filterType !== 'EXCLUDE',
                    title: '字体色',
                    desc: '设置匹配到的日志条目的字体颜色'
                },
                {
                    type: 'color',
                    key: 'background',
                    disabled: (record) => !record.dyeing && record.filterType !== 'EXCLUDE',
                    title: '背景色',
                    desc: '设置匹配到的日志条目的背景颜色'
                }
            ]}
            selectedRowKeys={enabledRules}
            onSelectionChanged={onEnabledChanged}
            onAddRule={(rule) => addFilter(ruleSetKey, rule)}
            onChangeRule={(index, rule) => setFilter(ruleSetKey, index, rule)}
            onDeleteRule={(index) => delFilter(ruleSetKey, index)}
            onInsertRule={(oldIndex, newIndex) => insertFilter(ruleSetKey, oldIndex, newIndex)}
        />
    )
}
