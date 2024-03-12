import * as React from 'react';
import { Dropdown, MenuProps } from 'antd';

export const TextField = React.forwardRef(function TextFieldRef({ value, placeholder, className, style, title, list, onChange, onEnter }: {
    value: string | undefined, placeholder?: string, style?: React.CSSProperties, className?: string | undefined,
    title?: string, list?: string | undefined,
    onChange: (value: string) => void, onEnter?: (value: string) => void,
}, ref: React.ForwardedRef<HTMLInputElement>) {
    const items: MenuProps['items'] = [
        { key: "selectAll", label: <div onClick={() => document.execCommand("selectAll")}>全选</div>, },
        { key: "copy", label: <div onClick={() => document.execCommand("copy")}>复制</div>, },
        { key: "cut", label: <div onClick={() => document.execCommand("cut")}>剪切</div>, },
        { key: "paste", label: <div onClick={() => document.execCommand("paste")}>粘贴</div>, },
    ];
    const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.currentTarget.value);
    }
    const onKeyUpHandler = (event: React.KeyboardEvent<HTMLInputElement>) => {
        event.key === "Enter" && event.currentTarget.blur();
    }
    const onBlurHandler = (event: React.FocusEvent<HTMLInputElement>) => {
        onEnter && onEnter(event.currentTarget.value);
    }
    return <div className='ruleInputWarpper' onContextMenu={(e) => e.stopPropagation()}>
        <Dropdown trigger={['contextMenu']} menu={{ items }}>
            <span style={{ display: 'flex', width: '100%' }}>
                <input className={((className ?? '') + " ruleInput").trim()} type='text'
                    title={title} value={value} placeholder={placeholder}
                    style={style} list={list} ref={ref}
                    onChange={onChangeHandler} onKeyUp={onKeyUpHandler}
                    onBlur={onBlurHandler}
                />
            </span>
        </Dropdown>
    </div>
});
