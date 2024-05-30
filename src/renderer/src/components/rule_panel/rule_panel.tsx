import React, { useState } from 'react'
import { Checkbox, Collapse, Divider, Flex, InputNumber, Slider, Space } from 'antd'
import { RuleLine_Color, RuleLine_Replace } from './rule_line'

type RuleCallbacks = {
    setReplaceRules: (replaceRules: ReplaceConfig[]) => void
    setColorRules: (colorRules: ColorConfig[]) => void
    setIsAlwaysOnTop: (isAlwaysOnTop: boolean) => void
    setIsShowHoverText: (isShowHoverText: boolean) => void
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
                    }
                ]}
                defaultActiveKey={['1', '2']}
            ></Collapse>
        </div>
    )
}
