import * as React from 'react';
import { TextField } from '../../common/text_field';
import { Button, Dropdown, Flex, MenuProps, Switch, Tooltip } from 'antd';

export const RegexTextField = function (prop: {
    fieldName: string, value: string | undefined, regexEnable: boolean | undefined,
    placeholder?: string, style?: React.CSSProperties, title?: string,
    onChange: (value: string) => void, onEnter?: (value: string) => void,
    onRegexEnableChange: (enable: boolean) => void,
}) {
    const [isEditing, setIsEditing] = React.useState(false);
    const [errorMsg, setErrorMsg] = React.useState("");

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

    const onFocus = () => {
        setIsEditing(true);
    }

    const onBlur = (event: React.FocusEvent<HTMLInputElement>) => {
        setIsEditing(false);
        prop.onChange(event.currentTarget.value);
    }

    return <>
        <Tooltip title={<span style={{ color: 'red' }}> {errorMsg}</span>} open={!!errorMsg && isEditing}>
            <TextField value={prop.value} placeholder={prop.placeholder} title={prop.title}
                addonBefore={prop.fieldName}
                onChange={prop.onChange} onFocus={onFocus} onBlur={onBlur}
                status={!!errorMsg ? "error" : undefined}
                style={{ ...prop.style }}

            />
        </Tooltip>
        <Flex gap={4} flex="0 0 auto" align="center">  启用正则
            <Switch size='small' checked={prop.regexEnable}
                title='使用正则表达式' onClick={() => prop.onRegexEnableChange(!prop.regexEnable)}>
            </Switch>
        </Flex>
    </>
}

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