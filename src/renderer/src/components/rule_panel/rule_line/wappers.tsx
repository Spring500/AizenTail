import * as React from 'react';
import { TextField } from '../../common/text_field';
import { Dropdown, MenuProps } from 'antd';

export const RegexTextField = React.forwardRef(function RegexTextFieldRef(prop: {
    fieldName: string, value: string | undefined, regexEnable: boolean | undefined,
    placeholder?: string, style?: React.CSSProperties, title?: string,
    onChange: (value: string) => void, onEnter?: (value: string) => void,
    onRegexEnableChange: (enable: boolean) => void,
}, ref: React.ForwardedRef<HTMLInputElement>) {
    const inputRef = React.useRef<HTMLInputElement>(null);
    React.useImperativeHandle(ref, () => inputRef.current!);

    const [isEditing, setIsEditing] = React.useState(false);
    const [errorMsg, setErrorMsg] = React.useState("");
    React.useEffect(() => {
        if (!inputRef.current) return;
        const input = inputRef.current;
        const onFocus = () => setIsEditing(true);
        const onBlur = () => setIsEditing(false);
        input.addEventListener('focus', onFocus);
        input.addEventListener('blur', onBlur);
        return () => {
            input.removeEventListener('focus', onFocus);
            input.removeEventListener('blur', onBlur);
        }
    }, [inputRef]);

    React.useEffect(() => {
        try {
            prop.regexEnable && prop.value && new RegExp(prop.value);
            setErrorMsg("");
        } catch (e) {
            let message = '正则表达式错误';
            if (e instanceof Error) {
                message = prop.value
                    ? e.message.replace(`/${prop.value}/:`, '')
                    : e.message;
            }
            setErrorMsg(message);
        }
    }, [prop.value]);


    const renderHint = () => {
        if (!errorMsg || !isEditing) return;
        return <div style={{ position: 'relative', height: "100%" }}>
            <div className='fieldHint'
                style={{ position: 'absolute', bottom: "100%", left: 0, color: 'red' }}>
                {errorMsg}</div>
        </div >;
    }

    return <>
        <span style={{ color: !!errorMsg ? "red" : undefined, }}>{prop.fieldName}</span>
        {renderHint()}
        <TextField value={prop.value} placeholder={prop.placeholder} title={prop.title}
            onChange={prop.onChange} onEnter={prop.onEnter} ref={inputRef}
            style={{ ...prop.style, border: !!errorMsg ? "1px solid red" : undefined }} />
        <button className={prop.regexEnable ? "ruleButton activatedButton" : "ruleButton"}
            title='使用正则表达式' onClick={() => prop.onRegexEnableChange(!prop.regexEnable)}>
            启用正则 </button>
    </>
});

export const RuleLineWarpper = function (prop: {
    children: React.ReactNode, index: number, enable: boolean, ruleCount: number,
    menuItems?: MenuProps['items'],
    onRuleUp: () => void, onRuleDown: () => void,
    onRuleEnable: () => void, onRuleDelete: () => void,
}) {
    const items: MenuProps['items'] = [];
    for (const item of prop.menuItems ?? []) {
        items.push(item);
    }
    items.push({ key: "up", label: <div onClick={prop.onRuleUp}>上移规则</div>, disabled: prop.index <= 0 });
    items.push({ key: "down", label: <div onClick={prop.onRuleDown}>下移规则</div>, disabled: prop.index >= prop.ruleCount - 1 });
    items.push({ key: "enable", label: <div onClick={prop.onRuleEnable}>{prop.enable ? "禁用规则" : "启用规则"}</div> });
    items.push({ key: "del", label: <div onClick={prop.onRuleDelete}>删除规则</div> });

    return <Dropdown trigger={['contextMenu']} key={prop.index} menu={{ items }}>
        <div className="ruleLine">
            <button className={prop.enable ? "ruleButton activatedButton" : "ruleButton"}
                onClick={prop.onRuleEnable} title="是否启用该规则"> 启用</button>
            {prop.children}
            <div className="fixedRuleBlock">
                <button className="ruleButton" onClick={prop.onRuleUp} title="将该条规则上移一行"
                    disabled={prop.index <= 0}>上移</button>
                <button className="ruleButton" onClick={prop.onRuleDown} title="将该条规则下移一行"
                    disabled={prop.index >= prop.ruleCount - 1}>下移</button>
                <button className="ruleButton" onClick={prop.onRuleDelete} title="删除该条规则">删除</button>
            </div>
        </div>
    </Dropdown>
}