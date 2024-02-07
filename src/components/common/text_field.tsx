import * as React from 'react';
import { ContextWarpper } from './context_wapper';

export const TextField = React.forwardRef(function ({ className, value, placeholder, style, title, list, onChange, onEnter }: {
    className?: string, value: string | undefined,
    placeholder?: string, style?: React.CSSProperties,
    title?: string, list?: string | undefined,
    onChange: (value: string) => void, onEnter?: (value: string) => void,
}, ref: React.Ref<HTMLInputElement> | undefined) {
    const inputRef = React.useRef<HTMLInputElement>(null);
    React.useImperativeHandle(ref, () => inputRef.current!);
    const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.currentTarget.value);
    }
    const onKeyUpHandler = (e: React.KeyboardEvent<HTMLInputElement>) => {
        e.key === "Enter" && e.currentTarget.blur();
    }
    const onBlurHandler = (e: React.FocusEvent<HTMLInputElement>) => {
        onEnter && onEnter(e.currentTarget.value);
    }
    return <input className={className} type='text'
        title={title} value={value} placeholder={placeholder}
        style={style} list={list} ref={inputRef}
        onChange={onChangeHandler} onKeyUp={onKeyUpHandler}
        onBlur={onBlurHandler}
    />;
});

export const EditorableTextField = React.forwardRef(function ({ value, placeholder, style, title, list, onChange, onEnter }: {
    value: string | undefined, placeholder?: string, style?: React.CSSProperties,
    title?: string, list?: string | undefined,
    onChange: (value: string) => void, onEnter?: (value: string) => void,
}, ref: React.Ref<HTMLInputElement> | undefined) {
    return <ContextWarpper className='ruleInputWarpper' menuItems={[
        { key: "selectAll", name: "全选", callback: () => document.execCommand("selectAll") },
        { key: "copy", name: "复制", callback: () => document.execCommand("copy") },
        { key: "cut", name: "剪切", callback: () => document.execCommand("cut") },
        { key: "paste", name: "粘贴", callback: () => document.execCommand("paste") },
    ]}>
        <TextField className="ruleInput" value={value}
            placeholder={placeholder} style={style} title={title}
            list={list} onChange={onChange} onEnter={onEnter} ref={ref} />
    </ContextWarpper>
});