import * as React from 'react';
import { TextField } from '../../common/text_field';
import { Button, Dropdown, Flex, MenuProps, Switch, Tooltip } from 'antd';

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

    return <>
        <Flex style={{ color: !!errorMsg ? "red" : undefined, }} align='center' flex='0 0 auto' gap={4}>
            {prop.fieldName}
        </Flex>
        <Tooltip title={<span style={{ color: 'red' }}> {errorMsg}</span>} open={!!errorMsg && isEditing}>
            <TextField value={prop.value} placeholder={prop.placeholder} title={prop.title}
                onChange={prop.onChange} onEnter={prop.onEnter} ref={inputRef}
                style={{ ...prop.style, border: !!errorMsg ? "1px solid red" : undefined, flex: "1 1 auto" }} />
        </Tooltip>
        <Flex gap={4} flex="0 0 auto" align="center">  启用正则
            <Switch size='small' checked={prop.regexEnable}
                title='使用正则表达式' onClick={() => prop.onRegexEnableChange(!prop.regexEnable)}>
            </Switch>
        </Flex>
    </>
});

export const RuleLineWarpper = function (prop: {
    children: React.ReactNode, index: number, enable: boolean, ruleCount: number,
    menuItems?: MenuProps['items'],
    onRuleUp: () => void, onRuleDown: () => void,
    onRuleEnable: (result: boolean) => void, onRuleDelete: () => void,
}) {
    const items: MenuProps['items'] = [];
    for (const item of prop.menuItems ?? []) {
        items.push(item);
    }
    items.push({ key: "up", label: <div onClick={prop.onRuleUp}>上移规则</div>, disabled: prop.index <= 0 });
    items.push({ key: "down", label: <div onClick={prop.onRuleDown}>下移规则</div>, disabled: prop.index >= prop.ruleCount - 1 });
    items.push({ key: "enable", label: <div onClick={() => prop.onRuleEnable(!prop.enable)}>{prop.enable ? "禁用规则" : "启用规则"}</div> });
    items.push({ key: "del", label: <div onClick={prop.onRuleDelete}>删除规则</div> });

    return <Dropdown trigger={['contextMenu']} key={prop.index} menu={{ items }}>
        <Flex gap='small' align='center'>
            <Flex align="center" gap={4} flex="0 0 auto"> 启用
                <Switch size='small' title="是否启用该规则" onClick={prop.onRuleEnable} value={prop.enable} />
            </Flex>
            {prop.children}
            <Flex align='center' flex="0 0 auto">
                <Button size='small' type='text' onClick={prop.onRuleUp} title="将该条规则上移一行"
                    disabled={prop.index <= 0}> 上移</Button>
                <Button size='small' type='text' onClick={prop.onRuleDown} title="将该条规则下移一行"
                    disabled={prop.index >= prop.ruleCount - 1}> 下移</Button>
                <Button size='small' type='text' onClick={prop.onRuleDelete} title="删除该条规则"> 删除</Button>
            </Flex>
        </Flex>
    </Dropdown >
}