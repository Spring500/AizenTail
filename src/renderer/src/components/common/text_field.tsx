import * as React from 'react'
import { Input } from 'antd'

export const EditorableTextField: React.FC<{
    value: string | undefined
    placeholder?: string
    style?: React.CSSProperties
    title?: string
    list?: string | undefined
    onChange: (value: string) => void
    onFocus?: () => void
    onBlur?: () => void
}> = function ({ value, placeholder, style, title, list, onChange, onFocus, onBlur }) {
    return (
        <Input
            value={value}
            placeholder={placeholder}
            style={style}
            title={title}
            list={list}
            onChange={(e): void => onChange(e.currentTarget.value)}
            onBlur={onBlur}
            onFocus={onFocus}
            variant="filled"
            size="small"
        />
    )
}
