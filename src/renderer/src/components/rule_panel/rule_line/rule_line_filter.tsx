import React from 'react'
import { Button, Checkbox, ColorPicker, Space, Table, Tooltip } from 'antd'
import { ColumnsType } from 'antd/es/table'
import { TableRowSelection } from 'antd/es/table/interface'
import { RuleContext, SettingContext } from '@renderer/App'

const colmuns: ColumnsType<FilterConfig> = [
    {
        title: '匹配串',
        dataIndex: 'reg',
        key: 'reg',
        ellipsis: {
            showTitle: false
        },
        render: (text: string, record) => (
            <Tooltip placement="topLeft" title={text}>
                <span
                    style={{
                        color: record.color,
                        backgroundColor: record.background,
                        padding: '1px 8px',
                        borderRadius: '3px'
                    }}
                >
                    {text}
                </span>
            </Tooltip>
        )
    },
    {
        title: '正则',
        dataIndex: 'regexEnable',
        key: 'regexEnable',
        width: 60,
        render: (enable: boolean) => <Checkbox checked={enable} />
    },
    {
        title: '反向',
        dataIndex: 'exclude',
        key: 'exclude',
        width: 60,
        render: (enable: boolean) => <Checkbox checked={enable} />
    },
    {
        title: '字体色',
        dataIndex: 'color',
        key: 'color',
        width: 60,
        render: (text: string) => <ColorPicker value={text} />
    },
    {
        title: '背景色',
        dataIndex: 'background',
        key: 'background',
        width: 60,
        render: (text: string) => <ColorPicker value={text} />
    }
]

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
            console.log(selectedRowKeys)
        }
    }
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
