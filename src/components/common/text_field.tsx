import * as React from 'react';

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
        title={title}
        value={value}
        placeholder={placeholder}
        style={style}
        list={list}
        onChange={onChangeHandler}
        onKeyUp={onKeyUpHandler}
        onBlur={onBlurHandler}
        ref={inputRef}
    />;
});