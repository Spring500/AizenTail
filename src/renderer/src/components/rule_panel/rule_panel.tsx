import React, { useState } from 'react'
import {
    Checkbox,
    Collapse,
    ColorPicker,
    Divider,
    Flex,
    Form,
    GetRef,
    Input,
    InputNumber,
    Radio,
    Space,
    Table,
    Tooltip,
    Typography
} from 'antd'
import { RuleLine_Color, RuleLine_Replace } from './rule_line'
import { ColumnsType, TableRowSelection } from 'antd/es/table/interface'

type RuleCallbacks = {
    setReplaceRules: (replaceRules: ReplaceConfig[]) => void
    setColorRules: (colorRules: ColorConfig[]) => void
    setIsAlwaysOnTop: (isAlwaysOnTop: boolean) => void
    setIsShowHoverText: (isShowHoverText: boolean) => void
}
type FormInstance<T> = GetRef<typeof Form<T>>
const EditableContext = React.createContext<FormInstance<ColorConfig> | null>(null)

const colorRuleColmuns: ColumnsType<ColorConfig> = [
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

const replaceRuleColmuns: ColumnsType<ReplaceConfig> = [
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

export const RuleSubPanel: React.FC<{
    ruleNames: string[]
    replaceRules: ReplaceConfig[]
    colorRules: ColorConfig[]
}> = function (props) {
    const [selectedRule, setSelectedRule] = useState(-1)

    const options = props.ruleNames.map((ruleName, index) => {
        return { label: ruleName, value: index }
    })
    options.push({ label: '默认', value: options.length })

    const colorDatas = props.colorRules.map((rule, index) => {
        return { ...rule, key: index }
    })
    const replaceDatas = props.replaceRules.map((rule, index) => {
        return { ...rule, key: index }
    })

    const selectedColorRowKeys: React.Key[] = []
    for (let i = 0; i < colorDatas.length; i++) {
        if (colorDatas[i].enable) selectedColorRowKeys.push(i)
    }
    const selectedReplaceRowKeys: React.Key[] = []
    for (let i = 0; i < replaceDatas.length; i++) {
        if (replaceDatas[i].enable) selectedReplaceRowKeys.push(i)
    }

    const colorRowSelection: TableRowSelection<ColorConfig> = {
        selectedRowKeys: selectedColorRowKeys,
        onChange: (selectedRowKeys: React.Key[]): void => {
            console.log(selectedRowKeys)
        }
    }
    const replaceRowSelection: TableRowSelection<ReplaceConfig> = {
        selectedRowKeys: selectedReplaceRowKeys,
        onChange: (selectedRowKeys: React.Key[]): void => {
            console.log(selectedRowKeys)
        }
    }
    return (
        <Space direction="vertical" style={{ width: '100%' }}>
            <Radio.Group
                value={selectedRule}
                onChange={(e) => setSelectedRule(e.target.value)}
                optionType="button"
                buttonStyle="solid"
                options={options}
            />
            <Collapse
                items={[
                    {
                        key: '0',
                        label: '基础设置',
                        children: (
                            <Input
                                addonBefore="规则名"
                                variant="filled"
                                value={props.ruleNames[selectedRule]}
                                contentEditable={selectedRule === options.length - 1}
                            ></Input>
                        )
                    },
                    {
                        key: '1',
                        label: '筛选规则',
                        children: (
                            <Table
                                size="small"
                                dataSource={colorDatas}
                                columns={colorRuleColmuns}
                                rowSelection={colorRowSelection}
                                pagination={false}
                            />
                        )
                    },
                    {
                        key: '2',
                        label: '替换规则',
                        children: (
                            <Table
                                size="small"
                                dataSource={replaceDatas}
                                columns={replaceRuleColmuns}
                                rowSelection={replaceRowSelection}
                                pagination={false}
                            />
                        )
                    }
                ]}
                defaultActiveKey={['0']}
            ></Collapse>
        </Space>
    )
}

export const RulePanel: React.FC<{
    replaceRules: ReplaceConfig[]
    colorRules: ColorConfig[]
    isAlwaysOnTop: boolean
    isShowHoverText: boolean
    callbacks: RuleCallbacks
}> = function (props) {
    const [logLimit, setLogLimit] = useState(0)

    const callbacks = props.callbacks
    const addRule = (): void => callbacks.setColorRules([...props.colorRules, { reg: '' }])
    const addReplaceRule = (): void =>
        callbacks.setReplaceRules([...props.replaceRules, { reg: '', replace: '' }])
    return (
        <div className="ruleContainer" style={{ padding: '4px' }}>
            <Collapse
                items={[
                    {
                        key: '0',
                        label: '基础设定',
                        children: (
                            <Flex vertical>
                                <Divider orientation="left">日志设定</Divider>
                                <Space direction="vertical">
                                    <InputNumber
                                        min={0}
                                        max={100000}
                                        addonBefore={'日志上限'}
                                        variant="filled"
                                        keyboard
                                        value={logLimit}
                                        onChange={(value) => setLogLimit(value ?? 0)}
                                        formatter={(value) =>
                                            value && value > 0 ? value + '' : '无限制'
                                        }
                                    />
                                    <Checkbox
                                        checked={props.isShowHoverText}
                                        onChange={(e) =>
                                            callbacks.setIsShowHoverText(e.target.checked)
                                        }
                                    >
                                        日志悬浮提示
                                    </Checkbox>
                                </Space>

                                <Divider orientation="left">窗口设定</Divider>
                                <Checkbox
                                    checked={props.isAlwaysOnTop}
                                    onChange={(e) => callbacks.setIsAlwaysOnTop(e.target.checked)}
                                >
                                    窗口置顶
                                </Checkbox>
                            </Flex>
                        )
                    },
                    {
                        key: '1',
                        label: '颜色规则',
                        children: (
                            <>
                                {props.colorRules.map((_, index) => (
                                    <RuleLine_Color
                                        key={index}
                                        index={index}
                                        rules={props.colorRules}
                                        setRules={callbacks.setColorRules}
                                    />
                                ))}
                                <div className="ruleLine">
                                    {' '}
                                    <button className="ruleButton" onClick={addRule}>
                                        添加规则{' '}
                                    </button>{' '}
                                </div>
                            </>
                        )
                    },
                    {
                        key: '2',
                        label: '替换规则',
                        children: (
                            <>
                                {props.replaceRules.map((_, index) => (
                                    <RuleLine_Replace
                                        key={index}
                                        index={index}
                                        rules={props.replaceRules}
                                        setRules={callbacks.setReplaceRules}
                                    />
                                ))}
                                <button className="ruleButton" onClick={addReplaceRule}>
                                    添加规则
                                </button>
                            </>
                        )
                    },
                    {
                        key: '3',
                        label: '规则模板配置',
                        children: (
                            <RuleSubPanel
                                ruleNames={['配置1 战斗专用配置', '配置2']}
                                colorRules={props.colorRules}
                                replaceRules={props.replaceRules}
                            />
                        )
                    }
                ]}
                defaultActiveKey={['1', '2']}
            ></Collapse>
        </div>
    )
}
