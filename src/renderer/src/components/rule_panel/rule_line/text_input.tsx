import { Input } from 'antd'
import React from 'react'

export const RuleTextInput: React.FC<{
    value: string | undefined
    placeholder?: string
    disabled?: boolean
    title?: string
    spellCheck?: boolean
    status?: '' | 'error' | 'warning' | undefined
    style?: React.CSSProperties
    onChange?: (newValue: string | undefined) => void
    onConfirm: (newValue: string | undefined) => void
    onBlur?: () => void
    onFocus?: () => void
}> = function (props) {
    const [newValue, setNewValue] = React.useState(props.value)
    const handleChange = function (e: React.ChangeEvent<HTMLInputElement>): void {
        const value = e.target.value
        setNewValue(value)
        props.onChange?.(value)
    }
    const handleConfirm = function (): void {
        props.onConfirm(newValue)
    }
    const handleFocus = function (): void {
        setNewValue(props.value)
        props.onFocus?.()
    }
    const handleBlur = function (): void {
        if (newValue !== props.value) props.onConfirm(newValue)
        props.onBlur?.()
    }
    React.useEffect(() => {
        if (newValue !== props.value) setNewValue(props.value)
    }, [props.value])

    return (
        <Input
            value={newValue}
            spellCheck={props.spellCheck}
            status={props.status}
            style={props.style}
            placeholder={props.placeholder}
            disabled={props.disabled}
            title={props.title}
            onChange={handleChange}
            onPressEnter={handleConfirm}
            onBlur={handleBlur}
            onFocus={handleFocus}
        />
    )
}
