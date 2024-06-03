import React, { useState } from 'react'
import {
    Checkbox,
    Collapse,
    Divider,
    Flex,
    Form,
    GetRef,
    Input,
    InputNumber,
    Radio,
    Space
} from 'antd'
import { FilterRulePanel, ReplaceRulePanel } from './rule_line'

type RuleCallbacks = {
    setReplaceRules: (replaceRules: ReplaceConfig[]) => void
    setColorRules: (colorRules: ColorConfig[]) => void
    setIsAlwaysOnTop: (isAlwaysOnTop: boolean) => void
    setIsShowHoverText: (isShowHoverText: boolean) => void
}
type FormInstance<T> = GetRef<typeof Form<T>>
const EditableContext = React.createContext<FormInstance<ColorConfig> | null>(null)

export const RuleSubPanel: React.FC<{
    ruleNames: string[]
    replaceRules: ReplaceConfig[]
    colorRules: ColorConfig[]
}> = function (props) {
    const [selectedRule, setSelectedRule] = useState(-1)
    const ruleContext = React.useContext(EditableContext)

    const options = props.ruleNames.map((ruleName, index) => {
        return { label: ruleName, value: index }
    })
    options.push({ label: '默认', value: options.length })

    const replaceDatas = props.replaceRules.map((rule, index) => {
        return { ...rule, key: index }
    })

    const selectedReplaceRowKeys: React.Key[] = []
    for (let i = 0; i < replaceDatas.length; i++) {
        if (replaceDatas[i].enable) selectedReplaceRowKeys.push(i)
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
                        children: <FilterRulePanel rules={props.colorRules} />
                    },
                    {
                        key: '2',
                        label: '替换规则',
                        children: <ReplaceRulePanel rules={props.replaceRules} />
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
