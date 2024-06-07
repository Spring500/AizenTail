import { DndContext, DragEndEvent } from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
    Space,
    Button,
    Table,
    Input,
    Checkbox,
    RowProps,
    Popconfirm,
    Typography,
    ConfigProvider
} from 'antd'
import React from 'react'

type TKeyDesc<TKeyType> =
    | {
          key: keyof TKeyType
          title: string
          type: 'input' | 'checkbox' | 'color'
          desc?: string
      }
    | {
          key: keyof TKeyType
          title: string
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          render: (value: any, record: TKeyType, index: number) => React.ReactNode
      }
import { DeleteFilled, PlusCircleFilled, HolderOutlined } from '@ant-design/icons'
import { ColumnsType } from 'antd/es/table'
import { TableRowSelection } from 'antd/es/table/interface'
import { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'
import { RuleColorPicker } from './rule_line/color_picker'

const RowContext = React.createContext<{
    setActivatorNodeRef?: (element: HTMLElement | null) => void
    listeners?: SyntheticListenerMap
}>({})
const DragHandle: React.FC = () => {
    const { setActivatorNodeRef, listeners } = React.useContext(RowContext)
    return (
        <Button
            type="text"
            icon={<HolderOutlined />}
            style={{ cursor: 'move' }}
            ref={setActivatorNodeRef}
            {...listeners}
        />
    )
}

const Row: React.FC<RowProps> = (props) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        setActivatorNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ transition: null, id: props['data-row-key'] })

    const style: React.CSSProperties = {
        ...props.style,
        transform: CSS.Translate.toString(transform),
        transition,
        ...(isDragging ? { position: 'relative', zIndex: 9999 } : undefined)
    }

    const contextValue = { setActivatorNodeRef, listeners }
    return (
        <RowContext.Provider value={contextValue}>
            <tr {...props} ref={setNodeRef} style={style} {...attributes} />
        </RowContext.Provider>
    )
}

const renderEmptyTable = function (): React.ReactNode {
    return (
        <Space direction="vertical" style={{ width: '100%' }}>
            <Typography.Text disabled italic>
                暂无数组
            </Typography.Text>
        </Space>
    )
}

export const RuleTable = function <TDataType extends object>(props: {
    tableName?: string
    datas: TDataType[] | undefined
    keyDesc: TKeyDesc<TDataType>[]

    selectedRowKeys: number[]
    onSelectionChanged: (selectedRowKeys: number[]) => void

    onAddRule: (rule: TDataType) => void
    onChangeRule: (index: number, rule: TDataType) => void
    onDeleteRule: (index: number) => void
    onInsertRule: (oldIndex: number, newIndex: number) => void
}): React.ReactNode {
    const datas =
        props.datas?.map((rule, index) => {
            return { ...rule, key: String(index) }
        }) ?? []

    let colmuns: ColumnsType<TDataType> = props.keyDesc.map((desc) => {
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
                            title={desc.desc ?? desc.title}
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
                            title={desc.desc ?? desc.title}
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
                            title={desc.title}
                            tooltip={desc.desc ?? desc.title}
                            onChange={(newColor) => {
                                const newRule = { ...record, [desc.key]: newColor }
                                console.log('newColor', newRule)
                                return props.onChangeRule(index, newRule)
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
    colmuns = [
        { key: 'sort', align: 'center', width: 40, render: () => <DragHandle /> },
        ...colmuns,
        {
            title: '',
            key: 'action',
            width: 60,
            align: 'center',
            render: (_, _1, index) => (
                <Popconfirm title={`确认删除规则?`} onConfirm={() => props.onDeleteRule(index)}>
                    <Button icon={<DeleteFilled />} danger>
                        删除
                    </Button>
                </Popconfirm>
            )
        }
    ]

    const rowSelection: TableRowSelection<TDataType> = {
        selectedRowKeys: props.selectedRowKeys.map((key) => String(key)),
        onChange: (keys) => props.onSelectionChanged(keys.map((key) => parseInt(key as string)))
    }

    const onDragEnd = ({ active, over }: DragEndEvent): void => {
        if (over === null) return
        const old = parseInt(active.id as string)
        const now = parseInt(over.id as string)
        if (old !== now) props.onInsertRule(old, now)
    }

    return (
        <Space direction="vertical" style={{ width: '100%' }}>
            <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
                <SortableContext
                    items={datas.map((data) => data.key) ?? []}
                    strategy={verticalListSortingStrategy}
                >
                    <ConfigProvider renderEmpty={renderEmptyTable}>
                        <Table
                            title={(): React.ReactNode => (
                                <Typography>{props.tableName ?? ''}</Typography>
                            )}
                            components={{ body: { row: Row } }}
                            dataSource={datas}
                            columns={colmuns}
                            rowSelection={rowSelection}
                            pagination={false}
                            footer={() => (
                                <Button onClick={() => props.onAddRule({} as TDataType)}>
                                    <PlusCircleFilled /> 添加规则
                                </Button>
                            )}
                        />
                    </ConfigProvider>
                </SortableContext>
            </DndContext>
        </Space>
    )
}
