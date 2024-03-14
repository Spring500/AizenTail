import * as React from 'react';
import { Dropdown, Input, MenuProps } from 'antd';

export const TextField = function TextFieldRef(props: {
    value?: string | undefined, placeholder?: string,
    style?: React.CSSProperties, className?: string | undefined,
    title?: string, list?: string | undefined,
    status?: "error" | "warning" | undefined,
    addonBefore?: React.ReactNode, addonAfter?: React.ReactNode,
    onChange?: (value: string) => void,
    onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void,
    onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void,
}) {
    const [text, setText] = React.useState(props.value);
    const items: MenuProps['items'] = [
        { key: "selectAll", label: <div onClick={() => document.execCommand("selectAll")}>全选</div>, },
        { key: "copy", label: <div onClick={() => document.execCommand("copy")}>复制</div>, },
        { key: "cut", label: <div onClick={() => document.execCommand("cut")}>剪切</div>, },
        { key: "paste", label: <div onClick={() => document.execCommand("paste")}>粘贴</div>, },
    ];
    React.useEffect(() => setText(props.value), [props.value]);
    const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        setText(e.currentTarget.value);
        props.onChange?.(e.currentTarget.value);
    }
    const onKeyUpHandler = (event: React.KeyboardEvent<HTMLInputElement>) => {
        event.key === "Enter" && event.currentTarget.blur();
    }
    const onBlurHandler = (event: React.FocusEvent<HTMLInputElement>) => {
        props.onBlur?.(event);
    }
    return <div onContextMenu={(e) => e.stopPropagation()} style={{ flex: '1 1 auto', minWidth: 0, height: 'anto' }}>
        <Dropdown trigger={['contextMenu']} menu={{ items }}>
            <span style={{ display: 'flex', width: '100%' }}>
                <Input className={props.className} type='text' size='small'
                    title={props.title} value={text} placeholder={props.placeholder}
                    list={props.list} allowClear
                    // style={props.style} 
                    styles={{ affixWrapper: props.style }}
                    status={props.status}
                    addonBefore={props.addonBefore} addonAfter={props.addonAfter}
                    onChange={onChangeHandler} onKeyUp={onKeyUpHandler}
                    onBlur={onBlurHandler}
                    onFocus={props.onFocus}
                />
            </span>
        </Dropdown>
    </div>
}
