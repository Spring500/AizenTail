import React from 'react'
import { Tooltip } from 'antd'
import { RuleTextInput } from './text_input'

const CheckReg = function (
    value: string | undefined,
    regexEnable: boolean | undefined
): string | undefined {
    if (!value || value === '' || !regexEnable) {
        return undefined
    }
    try {
        new RegExp(value)
        return undefined
    } catch (e) {
        if (e instanceof Error) return e.message
        else return '正则表达式错误\n' + e
    }
}

export const RegExInput: React.FC<{
    value: string | undefined
    regexEnable: boolean | undefined
    title?: string
    style?: React.CSSProperties
    onChange?: (value: string | undefined) => void
}> = function ({ value, title, regexEnable, style, onChange }) {
    const [isEditing, setIsEditing] = React.useState(false)
    const [errorTooltip, setErrorTooltip] = React.useState<string | undefined>(() =>
        CheckReg(value, regexEnable)
    )

    React.useEffect(() => {
        setErrorTooltip(CheckReg(value, regexEnable))
    }, [value, regexEnable])
    const handleOnChange = (reg: string | undefined): void =>
        setErrorTooltip(CheckReg(reg, regexEnable))
    return (
        <Tooltip
            color="red"
            placement="topLeft"
            title={errorTooltip}
            open={isEditing && !!errorTooltip}
        >
            <RuleTextInput
                spellCheck={false}
                status={errorTooltip ? 'error' : undefined}
                style={style}
                value={value ?? ''}
                title={title}
                onConfirm={(reg) => onChange?.(reg)}
                onChange={handleOnChange}
                onBlur={() => setIsEditing(false)}
                onFocus={() => setIsEditing(true)}
            />
        </Tooltip>
    )
}
