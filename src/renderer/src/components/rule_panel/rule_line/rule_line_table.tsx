import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Space, Button, Table, Input, ColorPicker, Checkbox, RowProps, Popconfirm } from 'antd'
import React from 'react'

type TKeyDesc<TKeyType> =
    | {
          key: keyof TKeyType
          title: string
          type: 'input' | 'checkbox' | 'color'
      }
    | {
          key: keyof TKeyType
          title: string
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          render: (value: any, record: TKeyType, index: number) => React.ReactNode
      }
import { DeleteFilled, PlusCircleFilled } from '@ant-design/icons'
import { ColumnsType } from 'antd/es/table'
import { TableRowSelection } from 'antd/es/table/interface'
import { Color } from 'antd/es/color-picker'

const getColorStr = (color: Color | undefined): string | undefined => {
    if (!color) return undefined
    return color.cleared ? undefined : color.toHexString()
}
const RuleColorPicker: React.FC<{
    color: string | undefined
    onChange: (color: Color) => void
}> = function ({ color, onChange }) {
    return <ColorPicker allowClear disabledAlpha value={color} onChangeComplete={onChange} />
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

export const RuleTable = function <TDataType extends object>(props: {
    datas: TDataType[] | undefined
    keyDesc: TKeyDesc<TDataType>[]

    selectedRowKeys: number[]
    onSelectionChanged: (selectedRowKeys: number[]) => void

    onAddRule: (rule: TDataType) => void
    onChangeRule: (index: number, rule: TDataType) => void
    onDeleteRule: (index: number) => void
    onInsertRule: (oldIndex: number, newIndex: number) => void
}): React.ReactNode {
    const datas = props.datas?.map((rule, index) => {
        return { ...rule, key: String(index) }
    })

    const colmuns: ColumnsType<TDataType> = props.keyDesc.map((desc) => {
        if ('render' in desc) {
            return {
                title: desc.title,
                dataIndex: desc.key as string,
                key: desc.key as string,
                render: desc.render
            }
        }
        switch (desc.type) {
            case 'input':
                return {
                    title: desc.title,
                    dataIndex: desc.key as string,
                    key: desc.key as string,
                    render: (text, record, index): React.ReactNode => (
                        <Input
                            value={text}
                            onChange={(value) =>
                                props.onChangeRule(index, {
                                    ...record,
                                    [desc.key]: value.target.value
                                })
                            }
                        />
                    )
                }
            case 'checkbox':
                return {
                    title: desc.title,
                    dataIndex: desc.key as string,
                    key: desc.key as string,
                    align: 'center',
                    width: 60,
                    render: (enable: boolean, record, index) => (
                        <Checkbox
                            checked={enable}
                            onChange={(e) => {
                                const newRule = { ...record, [desc.key]: e.target.checked }
                                props.onChangeRule(index, newRule)
                            }}
                        />
                    )
                }
            case 'color':
                return {
                    title: desc.title,
                    dataIndex: desc.key as string,
                    key: desc.key as string,
                    align: 'center',
                    width: 60,
                    render: (color: string, record, index) => (
                        <RuleColorPicker
                            color={color}
                            onChange={(color) => {
                                const newRule = { ...record, [desc.key]: getColorStr(color) }
                                props.onChangeRule(index, newRule)
                            }}
                        />
                    )
                }
            default:
                return {
                    title: desc.title,
                    dataIndex: desc.key as string,
                    key: desc.key as string
                }
        }
    })
    colmuns.push({
        title: '操作',
        key: 'action',
        width: 80,
        align: 'center',
        render: (_, _1, index) => (
            <Popconfirm title={`确认删除规则?`} onConfirm={() => props.onDeleteRule(index)}>
                <Button icon={<DeleteFilled />} danger>
                    删除
                </Button>
            </Popconfirm>
        )
    })

    const rowSelection: TableRowSelection<TDataType> = {
        selectedRowKeys: props.selectedRowKeys.map((key) => String(key)),
        onChange: (keys) => props.onSelectionChanged(keys.map((key) => parseInt(key as string)))
    }

    // --------拖动相关----------------------------------------------------------
    const pointerSensor = useSensor(PointerSensor, {
        activationConstraint: { distance: { y: 20 } }
    })
    const sensors = useSensors(pointerSensor)
    const onDragEnd = ({ active, over }: DragEndEvent): void => {
        if (over === null) return
        const old = parseInt(active.id as string)
        const now = parseInt(over.id as string)
        if (old !== now) props.onInsertRule(old, now)
    }

    return (
        <Space direction="vertical" style={{ width: '100%' }}>
            <Button onClick={() => props.onAddRule({} as TDataType)}>
                <PlusCircleFilled /> 添加规则
            </Button>
            <DndContext
                sensors={sensors}
                modifiers={[restrictToVerticalAxis]}
                onDragEnd={onDragEnd}
            >
                <SortableContext
                    items={datas?.map((data) => data.key) ?? []}
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
