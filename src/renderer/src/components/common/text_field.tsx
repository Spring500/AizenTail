import * as React from 'react'
import { ContextWarpper } from './context_wapper'

export const TextField = React.forwardRef(function TextFieldRef(
    {
        className,
        value,
        placeholder,
        style,
        title,
        list,
        onChange,
        onEnter
    }: {
        className?: string
        value: string | undefined
        placeholder?: string
        style?: React.CSSProperties
        title?: string
        list?: string | undefined
        onChange: (value: string) => void
        onEnter?: (value: string) => void
    },
    ref: React.ForwardedRef<HTMLInputElement>
) {
    const inputRef = React.useRef<HTMLInputElement>(null)
    React.useImperativeHandle(ref, () => inputRef.current!)
    const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>): void => {
        onChange(e.currentTarget.value)
    }
    const onKeyUpHandler = (event: React.KeyboardEvent<HTMLInputElement>): void => {
        event.key === 'Enter' && event.currentTarget.blur()
    }
    const onBlurHandler = (event: React.FocusEvent<HTMLInputElement>): void => {
        onEnter && onEnter(event.currentTarget.value)
    }
    return (
        <input
            className={className}
            type="text"
            title={title}
            value={value}
            placeholder={placeholder}
            style={style}
            list={list}
            ref={inputRef}
            onChange={onChangeHandler}
            onKeyUp={onKeyUpHandler}
            onBlur={onBlurHandler}
        />
    )
})

export const EditorableTextField = React.forwardRef(function EditorableTextFieldRef(
    {
        value,
        placeholder,
        style,
        title,
        list,
        onChange,
        onEnter
    }: {
        value: string | undefined
        placeholder?: string
        style?: React.CSSProperties
        title?: string
        list?: string | undefined
        onChange: (value: string) => void
        onEnter?: (value: string) => void
    },
    ref: React.ForwardedRef<HTMLInputElement>
) {
    return (
        <ContextWarpper
            className="ruleInputWarpper"
            menuItems={[
                {
                    key: 'selectAll',
                    name: '全选',
                    callback: () => document.execCommand('selectAll')
                },
                { key: 'copy', name: '复制', callback: () => document.execCommand('copy') },
                { key: 'cut', name: '剪切', callback: () => document.execCommand('cut') },
                { key: 'paste', name: '粘贴', callback: () => document.execCommand('paste') }
            ]}
        >
            <TextField
                className="ruleInput"
                value={value}
                placeholder={placeholder}
                style={style}
                title={title}
                list={list}
                onChange={onChange}
                onEnter={onEnter}
                ref={ref}
            />
        </ContextWarpper>
    )
})
