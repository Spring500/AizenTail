import React from 'react'
import { Button, Checkbox, ColorPicker, Input, Space, Table, Tooltip } from 'antd'
import { ColumnsType } from 'antd/es/table'
import { TableRowSelection } from 'antd/es/table/interface'
import { RuleContext, SettingContext } from '@renderer/App'

export const FilterRulePanel: React.FC = function () {
    const ruleContext = React.useContext(RuleContext)
    const settingContext = React.useContext(SettingContext)
    const currentRuleSet = settingContext?.currentRuleSet ?? ''
    const datas =
        ruleContext?.rules?.[currentRuleSet]?.filterRules?.map((rule, index) => {
            return { ...rule, key: index }
        }) ?? []

    const selectedIndices: React.Key[] = []
    for (let i = 0; i < datas.length; i++) {
        if (datas[i].enable) selectedIndices.push(i)
    }

    const rowSelection: TableRowSelection<FilterConfig> = {
        selectedRowKeys: selectedIndices,
        onChange: (selectedRowKeys: React.Key[]): void => {
            const newRules = { ...ruleContext?.rules }
            newRules[currentRuleSet].filterRules = newRules[currentRuleSet].filterRules?.map(
                (rule, index) => {
                    return {
                        ...rule,
                        enable: selectedRowKeys.includes(index)
                    }
                }
            )
            ruleContext?.resetRules(newRules)
        }
    }

    const colmuns: ColumnsType<FilterConfig> = [
        {
            title: '匹配串',
            dataIndex: 'reg',
            key: 'reg',
            ellipsis: {
                showTitle: false
            },
            render: (text: string, record, index) => (
                <Tooltip placement="topLeft" title={text}>
                    <Input
                        style={{
                            color: record.color,
                            backgroundColor: record.background
                        }}
                        value={text}
                        onChange={(value) => {
                            ruleContext?.setFilter(currentRuleSet, index, {
                                ...record,
                                reg: value.target.value
                            })
                        }}
                    />
                </Tooltip>
            )
        },
        {
            title: '正则',
            dataIndex: 'regexEnable',
            key: 'regexEnable',
            width: 60,
            render: (enable: boolean, record, index) => (
                <Checkbox
                    checked={enable}
                    onChange={(e) => {
                        ruleContext?.setFilter(currentRuleSet, index, {
                            ...record,
                            regexEnable: e.target.checked
                        })
                    }}
                />
            )
        },
        {
            title: '反向',
            dataIndex: 'exclude',
            key: 'exclude',
            width: 60,
            render: (enable: boolean, record, index) => (
                <Checkbox
                    checked={enable}
                    onChange={(e) => {
                        ruleContext?.setFilter(currentRuleSet, index, {
                            ...record,
                            exclude: e.target.checked
                        })
                    }}
                />
            )
        },
        {
            title: '字体色',
            dataIndex: 'color',
            key: 'color',
            width: 60,
            render: (text: string, _, index) => (
                <ColorPicker
                    allowClear
                    disabledAlpha
                    value={text}
                    onChangeComplete={(color) => {
                        ruleContext?.setFilter(currentRuleSet, index, {
                            ...datas[index],
                            color: color.cleared ? undefined : color.toHexString()
                        })
                    }}
                />
            )
        },
        {
            title: '背景色',
            dataIndex: 'background',
            key: 'background',
            width: 60,
            render: (text: string, _, index) => (
                <ColorPicker
                    allowClear
                    disabledAlpha
                    value={text}
                    onChangeComplete={(color) => {
                        ruleContext?.setFilter(currentRuleSet, index, {
                            ...datas[0],
                            background: color.cleared ? undefined : color.toHexString()
                        })
                    }}
                />
            )
        }
    ]
    return (
        <Space direction="vertical" style={{ width: '100%' }}>
            <Button onClick={() => ruleContext?.addFilter(currentRuleSet, { reg: '' })}>
                添加规则
            </Button>
            <Table
                dataSource={datas}
                columns={colmuns}
                rowSelection={rowSelection}
                pagination={false}
            />
        </Space>
    )
}
