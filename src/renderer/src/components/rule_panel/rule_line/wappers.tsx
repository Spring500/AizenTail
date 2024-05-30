import * as React from 'react'
import { Checkbox, ConfigProvider, Dropdown, Input, Tooltip } from 'antd'
import { ItemType } from 'antd/es/menu/interface'
import { AliasToken } from 'antd/es/theme/internal'

export const RegexTextField: React.FC<{
    fieldName: string
    value: string | undefined
    regexEnable: boolean | undefined
    placeholder?: string
    style?: React.CSSProperties
    title?: string
    onChange: (value: string) => void
    onRegexEnableChange: (enable: boolean) => void
}> = function (prop) {
    const [isEditing, setIsEditing] = React.useState(false)
    const [errorMsg, setErrorMsg] = React.useState('')

    React.useEffect(() => {
        try {
            prop.regexEnable && prop.value && new RegExp(prop.value)
            setErrorMsg('')
        } catch (e) {
            let message = '正则表达式错误'
            if (e instanceof Error) {
                message = prop.value ? e.message.replace(`/${prop.value}/:`, '') : e.message
            }
            setErrorMsg(message)
        }
    }, [prop.value])

    const token: Partial<AliasToken> = {}
    if (prop.style?.color) token.colorText = prop.style.color
    if (prop.style?.backgroundColor) {
        const color = prop.style.backgroundColor
        token.colorBgContainer = color
        token.colorFillTertiary = color
        token.colorFillSecondary = color
    }
    return (
        <>
            <Tooltip title={errorMsg} open={!!errorMsg && !!isEditing} color="red">
                <ConfigProvider theme={{ token }}>
                    <Input
                        addonBefore={
                            <span
                                style={{
                                    color: errorMsg ? 'red' : undefined,
                                    background: undefined
                                }}
                            >
                                {prop.fieldName}
                            </span>
                        }
                        value={prop.value}
                        placeholder={prop.placeholder}
                        style={{ ...prop.style, backgroundColor: undefined }}
                        title={prop.title}
                        status={errorMsg ? 'error' : undefined}
                        onChange={(e): void => prop.onChange(e.currentTarget.value)}
                        onFocus={() => setIsEditing(true)}
                        onBlur={() => setIsEditing(false)}
                        variant="filled"
                        size="small"
                    />
                </ConfigProvider>
            </Tooltip>
            <Checkbox
                className={'ruleCheckBox'}
                checked={prop.regexEnable}
                onChange={() => prop.onRegexEnableChange(!prop.regexEnable)}
            >
                正则匹配
            </Checkbox>
        </>
    )
}

export const RuleLineWarpper: React.FC<{
    children: React.ReactNode
    index: number
    enable: boolean
    ruleCount: number
    menuItems?: {
        key: string
        name: string | (() => string)
        disabled?: boolean
        callback: () => void
    }[]
    onRuleUp: () => void
    onRuleDown: () => void
    onRuleEnable: () => void
    onRuleDelete: () => void
}> = function (prop) {
    const menuItems: ItemType[] = []
    for (const item of prop.menuItems ?? []) {
        menuItems.push({ ...item })
    }
    menuItems.push({
        key: 'up',
        label: '上移规则',
        disabled: prop.index <= 0,
        onClick: prop.onRuleUp
    })
    menuItems.push({
        key: 'down',
        label: '下移规则',
        disabled: prop.index >= prop.ruleCount - 1,
        onClick: prop.onRuleDown
    })
    menuItems.push({
        key: 'enable',
        label: prop.enable ? '禁用规则' : '启用规则',
        onClick: prop.onRuleEnable
    })
    menuItems.push({ key: 'del', label: '删除规则', onClick: prop.onRuleDelete })

    return (
        <Dropdown trigger={['contextMenu']} menu={{ items: menuItems }}>
            <div className="ruleLine">
                <Checkbox
                    className="ruleCheckBox"
                    checked={prop.enable}
                    onClick={prop.onRuleEnable}
                >
                    启用
                </Checkbox>
                {prop.children}
                <div className="fixedRuleBlock">
                    <button
                        className="ruleButton"
                        onClick={prop.onRuleUp}
                        title="将该条规则上移一行"
                        disabled={prop.index <= 0}
                    >
                        上移
                    </button>
                    <button
                        className="ruleButton"
                        onClick={prop.onRuleDown}
                        title="将该条规则下移一行"
                        disabled={prop.index >= prop.ruleCount - 1}
                    >
                        下移
                    </button>
                    <button className="ruleButton" onClick={prop.onRuleDelete} title="删除该条规则">
                        删除
                    </button>
                </div>
            </div>
        </Dropdown>
    )
}
