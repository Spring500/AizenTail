import React, { useState } from 'react'
import {
    Button,
    Checkbox,
    Collapse,
    Divider,
    Empty,
    Flex,
    Input,
    InputNumber,
    Popconfirm,
    Radio,
    Space
} from 'antd'
import { FilterRulePanel, ReplaceRulePanel } from './rule_line'
import { RuleContext, SettingContext } from '@renderer/App'
import { logManager } from '@renderer/managers/log_manager'
import { PlusCircleFilled, DeleteFilled } from '@ant-design/icons'

export const RuleSubPanel: React.FC = function () {
    const ruleContext = React.useContext(RuleContext)
    const settingContext = React.useContext(SettingContext)
    const [activeCollapseKeys, setActiveCollapseKeys] = React.useState(['0', '1'])
    const selectedRule = settingContext?.currentRuleSet

    const options: string[] = ['default']
    for (const ruleName in ruleContext?.rules ?? {}) {
        if (!options.includes(ruleName)) options.push(ruleName)
    }
    const ruleSetExists = !!selectedRule && selectedRule in (ruleContext?.rules ?? {})
    const genNewSetName = function (): string {
        let i = 0
        while (options.includes(`rule${i}`)) i++
        return `rule${i}`
    }
    return (
        <Space direction="vertical" style={{ width: '100%' }}>
            <Space>
                规则集
                <Radio.Group
                    value={selectedRule}
                    onChange={(e) => settingContext?.setCurrentRuleSet(e.target.value)}
                    optionType="button"
                    buttonStyle="solid"
                    options={options}
                />
                <Button onClick={() => ruleContext?.newRuleSet(genNewSetName())}>
                    <PlusCircleFilled /> 添加规则集
                </Button>
                <Popconfirm
                    title={`确定删除规则集${selectedRule}？`}
                    onConfirm={() => ruleContext?.deleteRuleSet(selectedRule)}
                >
                    <Button disabled={selectedRule === 'default'}>
                        <DeleteFilled /> 删除规则集
                    </Button>
                </Popconfirm>
            </Space>
            {
                // 如果规则集不存在则不显示规则
                !ruleSetExists ? (
                    <Empty />
                ) : (
                    <Collapse
                        items={[
                            {
                                key: '0',
                                label: '基础设置',
                                children: (
                                    <Input
                                        addonBefore="规则名"
                                        variant="filled"
                                        value={selectedRule}
                                        disabled={selectedRule === 'default'}
                                    ></Input>
                                )
                            },
                            { key: '1', label: '筛选规则', children: <FilterRulePanel /> },
                            { key: '2', label: '替换规则', children: <ReplaceRulePanel /> }
                        ]}
                        onChange={(keys) =>
                            setActiveCollapseKeys(typeof keys === 'string' ? [keys] : keys)
                        }
                        activeKey={activeCollapseKeys}
                    ></Collapse>
                )
            }
        </Space>
    )
}

export const RulePanel: React.FC = function () {
    const settingContext = React.useContext(SettingContext)
    const [logLimit, setLogLimit] = useState(0)
    const [activeCollapseKeys, setActiveCollapseKeys] = React.useState(['0', '1'])
    React.useEffect(() => {
        logManager.setFilterDisabled(!settingContext?.isFiltering)
    }, [settingContext?.isFiltering])

    React.useEffect(() => {
        window.electron.setAlwaysOnTop(!!settingContext?.isAlwaysOnTop)
    }, [settingContext?.isAlwaysOnTop])

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
                                        checked={settingContext?.isShowHoverText}
                                        onChange={(e) =>
                                            settingContext?.setIsShowHoverText(e.target.checked)
                                        }
                                    >
                                        日志悬浮提示
                                    </Checkbox>
                                </Space>

                                <Divider orientation="left">窗口设定</Divider>
                                <Checkbox
                                    checked={settingContext?.isAlwaysOnTop}
                                    onChange={(e) =>
                                        settingContext?.setIsAlwaysOnTop(e.target.checked)
                                    }
                                >
                                    窗口置顶
                                </Checkbox>
                            </Flex>
                        )
                    },
                    { key: '1', label: '规则模板配置', children: <RuleSubPanel /> }
                ]}
                onChange={(keys) => setActiveCollapseKeys(typeof keys === 'string' ? [keys] : keys)}
                activeKey={activeCollapseKeys}
            ></Collapse>
        </div>
    )
}
