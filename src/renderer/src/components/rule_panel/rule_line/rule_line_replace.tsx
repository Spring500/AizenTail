import React from 'react'
import { Checkbox, Table, Tooltip } from 'antd'
import { ColumnsType } from 'antd/es/table'
import { TableRowSelection } from 'antd/es/table/interface'

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
export const ReplaceRulePanel: React.FC<{
    rules: ReplaceConfig[]
}> = function (props) {
    const datas = props.rules.map((rule, index) => {
        return { ...rule, key: index }
    })

    const selectedReplaceRowKeys: React.Key[] = []
    for (let i = 0; i < datas.length; i++) {
        if (datas[i].enable) selectedReplaceRowKeys.push(i)
    }

    const rowSelection: TableRowSelection<ReplaceConfig> = {
        selectedRowKeys: selectedReplaceRowKeys,
        onChange: (selectedRowKeys: React.Key[]): void => {
            console.log(selectedRowKeys)
        }
    }
    return (
        <>
            <Table
                dataSource={datas}
                columns={colmuns}
                rowSelection={rowSelection}
                pagination={false}
            />
        </>
    )
}
