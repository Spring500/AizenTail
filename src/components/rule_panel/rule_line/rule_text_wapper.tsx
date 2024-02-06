import * as React from 'react';
import { TextField } from '../../common/text_field';
import { ContextWarpper } from '../../common/context_wapper';

export const RuleTextField = React.forwardRef(function ({ value, placeholder, style, title, list, onChange, onEnter }: {
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