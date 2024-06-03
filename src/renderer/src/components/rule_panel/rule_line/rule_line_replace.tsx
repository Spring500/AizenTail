import React from 'react'
import { Button, Checkbox, Space, Table, Tooltip } from 'antd'
import { ColumnsType } from 'antd/es/table'
import { TableRowSelection } from 'antd/es/table/interface'
import { RuleContext, SettingContext } from '@renderer/App'

const colmuns: ColumnsType<ReplaceConfig> = [
    {
        title: '匹配串',
        dataIndex: 'reg',
        key: 'reg',
        ellipsis: {
            showTitle: false
        },
        render: (text: string) => (
            <Tooltip placement="topLeft" title={text}>
                {text}
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
        title: '替换串',
        dataIndex: 'replace',
        key: 'replace',
        ellipsis: {
            showTitle: false
        },
        render: (text: string) => (
            <Tooltip placement="topLeft" title={text}>
                {text}
            </Tooltip>
        )
    }
]
export const ReplaceRulePanel: React.FC = function () {
    const ruleContext = React.useContext(RuleContext)
    const settingContext = React.useContext(SettingContext)
    const currentRuleSet = settingContext?.currentRuleSet ?? ''
    const datas =
        ruleContext?.rules?.[currentRuleSet]?.replaceRules?.map((rule, index) => {
            return { ...rule, key: index }
        }) ?? []

    const selectedIndices: React.Key[] = []
    for (let i = 0; i < datas.length; i++) {
        if (datas[i].enable) selectedIndices.push(i)
    }

    const rowSelection: TableRowSelection<ReplaceConfig> = {
        selectedRowKeys: selectedIndices,
        onChange: (selectedRowKeys: React.Key[]): void => {
            console.log(selectedRowKeys)
        }
    }
    return (
        <Space direction="vertical" style={{ width: '100%' }}>
            <Button
                onClick={() => ruleContext?.addReplace(currentRuleSet, { reg: '', replace: '' })}
            >
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
