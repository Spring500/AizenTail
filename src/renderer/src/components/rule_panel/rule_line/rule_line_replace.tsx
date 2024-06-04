import React from 'react'
import { Button, Checkbox, Input, Popconfirm, RowProps, Space, Table, Tooltip } from 'antd'
import { ColumnsType } from 'antd/es/table'
import { ColumnType, TableRowSelection } from 'antd/es/table/interface'
import { RuleContext, SettingContext } from '@renderer/App'
import { DeleteFilled, PlusCircleFilled } from '@ant-design/icons'
import { ReplaceRegInput } from './rule_line_replace_reg'
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

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

export const ReplaceRulePanel: React.FC = function () {
    const ruleContext = React.useContext(RuleContext)
    const settingContext = React.useContext(SettingContext)
    const ruleSetKey = settingContext?.currentRuleSet ?? ''
    const datas =
        ruleContext?.rules?.[ruleSetKey]?.replaceRules?.map((rule, index) => {
            return { ...rule, key: index + '' }
        }) ?? []

    const selectedIndices: React.Key[] = []
    for (let i = 0; i < datas.length; i++) {
        if (datas[i].enable) selectedIndices.push(i + '')
    }

    const rowSelection: TableRowSelection<ReplaceConfig> = {
        selectedRowKeys: selectedIndices,
        onChange: (selectedRowKeys: React.Key[]): void => {
            const newRules = { ...ruleContext?.rules }
            const ruleSet = newRules[ruleSetKey]
            ruleSet.replaceRules = ruleSet.replaceRules?.map((rule, index) => {
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
                        ruleContext?.setReplace(ruleSetKey, index, newRule)
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
                    onConfirm={() => ruleContext?.delReplace(ruleSetKey, index)}
                >
                    <Button>
                        <DeleteFilled />
                        删除
                    </Button>
                </Popconfirm>
            )
        }
    }
    const newInputColumn = function <T>(
        key: keyof T,
        title: string,
        style: React.CSSProperties = {}
    ): ColumnType<T> {
        return {
            title: title,
            dataIndex: key as string,
            key: key as string,
            ellipsis: {
                showTitle: false
            },
            render: (text: string, record, index) => (
                <Tooltip placement="topLeft" title={text}>
                    <Input
                        style={style}
                        value={text}
                        onChange={(value) =>
                            ruleContext?.setReplace(ruleSetKey, index, {
                                ...record,
                                [key]: value.target.value
                            })
                        }
                    />
                </Tooltip>
            )
        }
    }
    const colmuns: ColumnsType<ReplaceConfig> = [
        {
            title: '匹配串',
            dataIndex: 'reg',
            key: 'reg',
            ellipsis: {
                showTitle: false
            },
            render: (text: string, _, index) => <ReplaceRegInput value={text} index={index} />
        },
        newCheckboxColumn('regexEnable', '正则'),
        newInputColumn('replace', '替换串'),
        newDelOperationColumn()
    ]
    const pointerSensor = useSensor(PointerSensor, {
        activationConstraint: { distance: { y: 20 } }
    })
    const sensors = useSensors(pointerSensor)
    const onDragEnd = ({ active, over }: DragEndEvent): void => {
        if (over === null) return
        const old = parseInt(active.id as string),
            now = parseInt(over.id as string)
        if (old !== now) {
            ruleContext?.insertReplace(ruleSetKey, old, now)
        }
    }
    return (
        <Space direction="vertical" style={{ width: '100%' }}>
            <Button onClick={() => ruleContext?.addReplace(ruleSetKey, { reg: '', replace: '' })}>
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
