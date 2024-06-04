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
    Popover,
    Radio,
    Space
} from 'antd'
import { FilterRulePanel, ReplaceRulePanel } from './rule_line'
import { RuleContext, SettingContext } from '@renderer/App'
import { logManager } from '@renderer/managers/log_manager'
import { PlusCircleFilled, DeleteFilled, EditFilled } from '@ant-design/icons'

export const RuleSubPanel: React.FC = function () {
    const ruleContext = React.useContext(RuleContext)
    const settingContext = React.useContext(SettingContext)
    const [activeCollapseKeys, setActiveCollapseKeys] = React.useState(['0', '1'])
    const [newName, setNewName] = useState('')
    const selectedRule = settingContext?.currentRuleSet

    let options: string[] = []
    for (const ruleName in ruleContext?.rules ?? {}) {
        if (!options.includes(ruleName) && ruleName !== 'default') options.push(ruleName)
    }
    options = ['default', ...options.sort()]
    const ruleSetExists = !!selectedRule && selectedRule in (ruleContext?.rules ?? {})
    const genNewSetName = function (): string {
        let i = 0
        while (options.includes(`rule${i}`)) i++
        return `rule${i}`
    }

    const genCopySetName = function (oldName: string | undefined): string {
        if (!oldName) return ''
        const matchNum = oldName.match(/_\d+$/)
        let i = matchNum ? parseInt(matchNum[0].slice(1)) : 0
        const realOldName = oldName.replace(/_\d+$/, '')
        while (options.includes(`${realOldName}_${i}`)) i++
        return `${realOldName}_${i}`
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
                <Button
                    onClick={() =>
                        ruleContext?.copyRuleSet(selectedRule, genCopySetName(selectedRule))
                    }
                >
                    复制规则集
                </Button>
                <Popconfirm
                    title={`确定删除规则集${selectedRule}？`}
                    onConfirm={() => ruleContext?.deleteRuleSet(selectedRule)}
                >
                    <Button disabled={selectedRule === 'default'}>
                        <DeleteFilled /> 删除规则集
                    </Button>
                </Popconfirm>
                <Popover
                    content={
                        <Space>
                            <Input
                                addonBefore={<EditFilled />}
                                onChange={(v) => setNewName(v.target.value)}
                            />
                            <Button
                                disabled={!newName}
                                onClick={() => ruleContext?.renameRuleSet(selectedRule, newName)}
                            >
                                确认
                            </Button>
                        </Space>
                    }
                    title="重命名规则集"
                    trigger="click"
                    // open={open}
                    // onOpenChange={handleOpenChange}
                >
                    <Button disabled={selectedRule === 'default'}>
                        <EditFilled /> 重命名规则集
                    </Button>
                </Popover>
            </Space>
            {
                // 如果规则集不存在则不显示规则
                !ruleSetExists ? (
                    <Empty />
                ) : (
                    <Collapse
                        size="small"
                        items={[
                            { key: '0', label: '筛选规则', children: <FilterRulePanel /> },
                            { key: '1', label: '替换规则', children: <ReplaceRulePanel /> }
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
