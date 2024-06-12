import React, { useState } from 'react'
import { Button, Flex, Input, Popconfirm, Popover, Radio, Space, Typography } from 'antd'
import { FilterRulePanel, ReplaceRulePanel } from './rule_line'
import { RuleContext, SettingContext } from '@renderer/context'
import { FileAddFilled, DeleteFilled, EditFilled, CopyFilled } from '@ant-design/icons'

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
                <EditFilled /> 重命名
            </Button>
        </Popover>
    )
}

export const RulePanel: React.FC = function () {
    const { ruleSets, newRuleSet, copyRuleSet, deleteRuleSet, renameRuleSet } =
        React.useContext(RuleContext)
    const { currentRuleSet, setCurrentRuleSet } = React.useContext(SettingContext)

    let options: string[] = []
    for (const ruleName in ruleSets ?? {}) {
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
        <Space direction="vertical" style={{ width: '100%' }} size={0}>
            <Flex justify="space-between">
                <Space>
                    <Typography.Text>规则集</Typography.Text>
                    <Radio.Group
                        value={currentRuleSet}
                        onChange={(e) => setCurrentRuleSet(e.target.value)}
                        optionType="button"
                        buttonStyle="solid"
                        options={options}
                    />
                </Space>
                <Space wrap>
                    <Typography.Text>规则集操作</Typography.Text>
                    <Button icon={<FileAddFilled />} onClick={() => newRuleSet(genNewSetName())}>
                        新建
                    </Button>
                    <Button
                        icon={<CopyFilled />}
                        onClick={() => copyRuleSet(currentRuleSet, genCopySetName(currentRuleSet))}
                    >
                        复制
                    </Button>
                    <RenameButton
                        value={currentRuleSet}
                        disabled={currentRuleSet === 'default'}
                        onChange={(newName) => renameRuleSet(currentRuleSet, newName)}
                    />
                    {/* <Button icon={<UploadOutlined />} disabled>
                        读取规则
                    </Button>
                    <Button icon={<SaveFilled />} disabled>
                        保存规则
                    </Button> */}

                    <Popconfirm
                        title={`确定删除规则集${currentRuleSet}？`}
                        onConfirm={() => deleteRuleSet(currentRuleSet)}
                    >
                        <Button
                            disabled={currentRuleSet === 'default'}
                            icon={<DeleteFilled />}
                            danger
                        >
                            删除
                        </Button>
                    </Popconfirm>
                </Space>
            </Flex>
            <FilterRulePanel />
            <ReplaceRulePanel />
        </Space>
    )
}
