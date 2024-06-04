import React from 'react'
import { Button, Checkbox, ColorPicker, Popconfirm, Space, Table } from 'antd'
import { ColumnsType } from 'antd/es/table'
import { ColumnType, TableRowSelection } from 'antd/es/table/interface'
import { RuleContext, SettingContext } from '@renderer/App'
import { Color } from 'antd/es/color-picker'
import { DeleteFilled, PlusCircleFilled } from '@ant-design/icons'
import { FilterRegInput } from './rule_line_filter_reg'
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const getColorStr = (color: Color | undefined): string | undefined => {
    if (!color) return undefined
    return color.cleared ? undefined : color.toHexString()
}
interface RowProps extends React.HTMLAttributes<HTMLTableRowElement> {
    'data-row-key': string
}

const Row: React.FC<RowProps> = (props) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        transition: null,
        id: props['data-row-key']
    })

    const style: React.CSSProperties = {
        ...props.style,
        transform: CSS.Translate.toString(transform),
        transition,
        cursor: 'move',
        ...(isDragging ? { position: 'relative', zIndex: 9999 } : undefined)
    }

    return <tr {...props} ref={setNodeRef} style={style} {...attributes} {...listeners} />
}

export const FilterRulePanel: React.FC = function () {
    const ruleContext = React.useContext(RuleContext)
    const settingContext = React.useContext(SettingContext)
    const ruleSetKey = settingContext?.currentRuleSet ?? ''
    const datas =
        ruleContext?.rules?.[ruleSetKey]?.filterRules?.map((rule, index) => {
            return { ...rule, key: index + '' }
        }) ?? []
    const selectedRowKeys: React.Key[] = []
    for (let index = 0; index < datas.length; index++) {
        if (datas[index].enable) selectedRowKeys.push(index + '')
    }

    const rowSelection: TableRowSelection<FilterConfig> = {
        selectedRowKeys,
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
    const RuleColorPicker: React.FC<{
        color: string | undefined
        onChange: (color: Color) => void
    }> = function ({ color, onChange }) {
        return <ColorPicker allowClear disabledAlpha value={color} onChangeComplete={onChange} />
    }
    const newColorColmun = function <T>(key: keyof T, title: string): ColumnType<T> {
        return {
            title: title,
            dataIndex: key as string,
            key: key as string,
            width: 60,
            align: 'center',
            render: (color: string, record, index) => (
                <RuleColorPicker
                    color={color}
                    onChange={(color) => {
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

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))
    const onDragEnd = ({ active, over }: DragEndEvent): void => {
        if (over === null) return
        const old = parseInt(active.id as string),
            now = parseInt(over.id as string)
        if (old !== now) {
            ruleContext?.swapFilter(ruleSetKey, old, now)
        }
    }
    return (
        <Space direction="vertical" style={{ width: '100%' }}>
            <Button onClick={() => ruleContext?.addFilter(ruleSetKey, { reg: '' })}>
                <PlusCircleFilled /> 添加规则
            </Button>
            <DndContext
                sensors={sensors}
                modifiers={[restrictToVerticalAxis]}
                onDragEnd={onDragEnd}
            >
                <SortableContext
                    items={datas.map((_, index) => index + '')}
                    strategy={verticalListSortingStrategy}
                >
                    <Table
                        components={{ body: { row: Row } }}
                        dataSource={datas}
                        columns={colmuns}
                        rowSelection={rowSelection}
                        pagination={false}
                    />
                </SortableContext>
            </DndContext>
        </Space>
    )
}
