import React from 'react'
import { Tooltip, Input } from 'antd'
import { RuleContext, SettingContext } from '@renderer/context'
export const ReplaceRegInput: React.FC<{
    value: string | undefined
    index: number
    title?: string
}> = function ({ value, index, title }) {
    const ruleContext = React.useContext(RuleContext)
    const settingContext = React.useContext(SettingContext)
    const ruleSetKey = settingContext?.currentRuleSet ?? ''
    const [isEditing, setIsEditing] = React.useState(false)
    const [errorTooltip, setErrorTooltip] = React.useState<string | undefined>(undefined)
    const rule = ruleContext?.rules?.[ruleSetKey]?.replaceRules?.[index] ?? {}

    React.useEffect(() => {
        if (!value || value === '' || !rule.regexEnable) {
            if (errorTooltip) setErrorTooltip(undefined)
            return
        }
        try {
            new RegExp(value)
            setErrorTooltip(undefined)
        } catch (e) {
            if (e instanceof Error) setErrorTooltip(e.message)
            else setErrorTooltip('正则表达式错误\n' + e)
        }
    }, [value, rule.regexEnable])
    return (
        <Tooltip
            color="red"
            placement="topLeft"
            title={errorTooltip}
            open={isEditing && !!errorTooltip}
        >
            <Input
                spellCheck={false}
                status={errorTooltip ? 'error' : undefined}
                value={value ?? ''}
                title={title}
                onChange={(e) =>
                    ruleContext?.setReplace(ruleSetKey, index, {
                        ...rule,
                        reg: e.target.value
                    })
                }
                onBlur={() => setIsEditing(false)}
                onFocus={() => setIsEditing(true)}
            />
        </Tooltip>
    )
}
