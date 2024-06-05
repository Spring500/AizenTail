import React, { useState } from 'react'
import { Button, Checkbox, Collapse, Input, Popconfirm, Popover, Radio, Space } from 'antd'
import { FilterRulePanel, ReplaceRulePanel } from './rule_line'
import { RuleContext, SettingContext } from '@renderer/App'
import { PlusCircleFilled, DeleteFilled, EditFilled, CopyFilled } from '@ant-design/icons'

const RenameButton: React.FC<{
    value: string | undefined
    disabled: boolean
    onChange: (newValue: string | undefined) => void
}> = function ({ value, disabled, onChange }) {
    const [newName, setNewName] = useState(value)
    return (
        <Popover
            content={
                <Space>
                    <Input
                        value={newName}
                        addonBefore={<EditFilled />}
                        onChange={(v) => setNewName(v.target.value)}
                    />
                    <Button disabled={!newName} onClick={() => onChange(newName)}>
                        确认
                    </Button>
                </Space>
            }
            title="重命名规则集"
            trigger="click"
            // open={open}
            onOpenChange={(open) => open && setNewName(value)}
        >
            <Button disabled={disabled}>
                <EditFilled /> 重命名规则集
            </Button>
        </Popover>
    )
}

export const RuleSubPanel: React.FC = function () {
    const ruleContext = React.useContext(RuleContext)
    const settingContext = React.useContext(SettingContext)
    const [newName, setNewName] = useState('')
    const selectedRule = settingContext?.currentRuleSet

    let options: string[] = []
    for (const ruleName in ruleContext?.rules ?? {}) {
        if (!options.includes(ruleName) && ruleName !== 'default') options.push(ruleName)
    }
    options = ['default', ...options.sort()]
    const genNewSetName = function (): string {
        let i = 1
        while (options.includes(`rule_${i}`)) i++
        return `rule_${i}`
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
                    <CopyFilled /> 复制规则集
                </Button>
                <RenameButton
                    value={selectedRule}
                    disabled={selectedRule === 'default'}
                    onChange={(newName) => ruleContext?.renameRuleSet(selectedRule, newName)}
                />
                <Popconfirm
                    title={`确定删除规则集${selectedRule}？`}
                    onConfirm={() => ruleContext?.deleteRuleSet(selectedRule)}
                >
                    <Button disabled={selectedRule === 'default'} icon={<DeleteFilled />} danger>
                        删除规则集
                    </Button>
                </Popconfirm>
            </Space>
            <FilterRulePanel />
            <ReplaceRulePanel />
        </Space>
    )
}

export const RulePanel: React.FC = function () {
    const settingContext = React.useContext(SettingContext)
    // const [logLimit, setLogLimit] = useState(0)
    const [activeCollapseKeys, setActiveCollapseKeys] = React.useState(['0', '1'])

    return (
        <div className="ruleContainer" style={{ padding: '4px' }}>
            <Collapse
                items={[
                    { key: '0', label: '规则模板配置', children: <RuleSubPanel /> },
                    {
                        key: '1',
                        label: '其它设置',
                        children: (
                            <Space direction="vertical">
                                <Space direction="vertical">
                                    {/* <InputNumber
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
                                    /> */}
                                    <Checkbox
                                        checked={settingContext?.isShowHoverText}
                                        onChange={(e) =>
                                            settingContext?.setIsShowHoverText(e.target.checked)
                                        }
                                    >
                                        日志悬浮提示
                                    </Checkbox>
                                </Space>
                                <Checkbox
                                    checked={settingContext?.isAlwaysOnTop}
                                    onChange={(e) =>
                                        settingContext?.setIsAlwaysOnTop(e.target.checked)
                                    }
                                >
                                    窗口置顶
                                </Checkbox>
                                <Checkbox
                                    checked={settingContext?.isCompactMode}
                                    onChange={(e) =>
                                        settingContext?.setIsCompactMode(e.target.checked)
                                    }
                                >
                                    紧凑模式
                                </Checkbox>
                                <Checkbox
                                    checked={settingContext?.isFiltering}
                                    onChange={(e) =>
                                        settingContext?.setIsFiltering(e.target.checked)
                                    }
                                >
                                    仅显示过滤规则匹配的日志
                                </Checkbox>
                                <Checkbox
                                    checked={settingContext?.colorTheme === 'dark'}
                                    onChange={(e) =>
                                        settingContext?.setColorTheme(
                                            e.target.checked ? 'dark' : 'light'
                                        )
                                    }
                                >
                                    暗色主题
                                </Checkbox>
                            </Space>
                        )
                    }
                ]}
                onChange={(keys) => setActiveCollapseKeys(typeof keys === 'string' ? [keys] : keys)}
                activeKey={activeCollapseKeys}
            ></Collapse>
        </div>
    )
}
