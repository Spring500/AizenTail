import React from 'react'
import { Button, Checkbox, ColorPicker, Input, Popconfirm, Space, Table, Tooltip } from 'antd'
import { ColumnsType } from 'antd/es/table'
import { ColumnType, TableRowSelection } from 'antd/es/table/interface'
import { RuleContext, SettingContext } from '@renderer/App'
import { Color } from 'antd/es/color-picker'
import { DeleteFilled, PlusCircleFilled } from '@ant-design/icons'
import { FilterRegInput } from './rule_line_filter_reg'

const getColorStr = (color: Color | undefined): string | undefined => {
    if (!color) return undefined
    return color.cleared ? undefined : color.toHexString()
}

export const FilterRulePanel: React.FC = function () {
    const ruleContext = React.useContext(RuleContext)
    const settingContext = React.useContext(SettingContext)
    const ruleSetKey = settingContext?.currentRuleSet ?? ''
    const datas =
        ruleContext?.rules?.[ruleSetKey]?.filterRules?.map((rule, index) => {
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
            const ruleSet = newRules[ruleSetKey]
            ruleSet.filterRules = ruleSet.filterRules?.map((rule, index) => {
                return { ...rule, enable: selectedRowKeys.includes(index) }
            })
            ruleContext?.resetRules(newRules)
        }
    }

    const newCheckboxColumn = function <T>(key: keyof T, title: string): ColumnType<T> {
        return {
            title: title,
            dataIndex: key as string,
            key: key as string,
            width: 60,
            align: 'center',
            render: (enable: boolean, _, index) => (
                <Checkbox
                    checked={enable}
                    onChange={(e) => {
                        const newRule = { ...datas[index], [key]: e.target.checked }
                        ruleContext?.setFilter(ruleSetKey, index, newRule)
                    }}
                />
            )
        }
    }

    const newColorColmun = function <T>(key: keyof T, title: string): ColumnType<T> {
        return {
            title: title,
            dataIndex: key as string,
            key: key as string,
            width: 60,
            align: 'center',
            render: (color: string, record, index) => (
                <ColorPicker
                    allowClear
                    disabledAlpha
                    value={color ?? null}
                    onChangeComplete={(color) => {
                        const newRule = { ...record, [key]: getColorStr(color) }
                        ruleContext?.setFilter(ruleSetKey, index, newRule)
                    }}
                />
            )
        }
    }
    const newDelOperationColumn = function <T>(): ColumnType<T> {
        return {
            key: 'operation',
            width: 80,
            align: 'center',
            render: (_, _2, index) => (
                <Popconfirm
                    title={`确认删除规则?`}
                    onConfirm={() => ruleContext?.delFilter(ruleSetKey, index)}
                >
                    <Button>
                        <DeleteFilled />
                        删除
                    </Button>
                </Popconfirm>
            )
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
            render: (text: string, _, index) => <FilterRegInput value={text} index={index} />
        },
        newCheckboxColumn('regexEnable', '正则'),
        newCheckboxColumn('exclude', '反向'),
        newColorColmun('color', '字体色'),
        newColorColmun('background', '背景色'),
        newDelOperationColumn()
    ]
    return (
        <Space direction="vertical" style={{ width: '100%' }}>
            <Button onClick={() => ruleContext?.addFilter(ruleSetKey, { reg: '' })}>
                <PlusCircleFilled /> 添加规则
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
