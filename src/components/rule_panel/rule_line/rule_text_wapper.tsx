import * as React from 'react';
import { TextField } from '../../common/text_field';
import { ContextWarpper } from '../../common/context_wapper';
import { DropdownWarpper } from '../../common/dropdown';

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

const colorList = ["null", "red", "green", "blue", "yellow", "black", "white", "gray", "purple", "pink", "orange", "brown", "cyan", "magenta"];

export const ColorRuleTextField = React.forwardRef(function ({ value, placeholder, style, title, onChange, onEnter }: {
    value: string | undefined, placeholder?: string, style?: React.CSSProperties, title?: string,
    onChange: (value: string) => void, onEnter?: (value: string) => void,
}, ref: React.Ref<HTMLInputElement> | undefined) {
    const [isColorMenuVisible, setIsColorMenuVisible] = React.useState(false);

    const colorMenuRef = React.useRef<HTMLUListElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);
    React.useImperativeHandle(ref, () => inputRef.current!);

    const onSelectColor = (color: string) => {
        onChange(color);
        onEnter && onEnter(color);
        console.log("选择颜色", color);
        closeColorList();
    }

    const closeColorList = () => {
        setIsColorMenuVisible(false);
    }

    const renderColorList = () => {
        return <DropdownWarpper visible={isColorMenuVisible}
            ref={colorMenuRef}
            style={{ position: 'fixed', left: 0, top: 0 }}
            onClickOutside={closeColorList}
            onOtherDropdownOpen={closeColorList}>
            <div style={{ padding: '0px 4px', overflowY: 'auto', }}>
                {colorList.map((color, index) => {
                    if (color === "null") color = '';
                    return <button key={index} onClick={() => onSelectColor(color)}
                        className='menuDropdownButton colorButton'>
                        <div className="colorBox" style={{ backgroundColor: color === "" ? undefined : color }} />
                        {color === "" ? "默认" : color}
                    </button>
                })}
            </div>
        </DropdownWarpper>;
    }

    React.useEffect(() => {
        if (!inputRef.current) return;
        const input = inputRef.current;
        const onContextMenu = (event: MouseEvent) => {
            event.preventDefault();
            setIsColorMenuVisible(!isColorMenuVisible);
            console.log("点击")
        }
        input.addEventListener('click', onContextMenu);
    }, [inputRef]);

    React.useEffect(() => {
        // 调整菜单位置
        if (!isColorMenuVisible) return;
        const input = inputRef.current;
        const menu = colorMenuRef.current;
        if (!input || !menu) return;
        const rect = input.getBoundingClientRect();
        menu.style.left = rect.left + 'px';
        menu.style.bottom = (window.innerHeight - rect.top) + 'px';
        menu.style.top = 'auto';
        const menuRect = menu.getBoundingClientRect();
        // 如果高度超过屏幕高度，bottom不变，调整top以压低菜单
        if (menuRect.top < 0) {
            menu.style.top = '0px';
        }
    }, [colorMenuRef, isColorMenuVisible]);

    return <ContextWarpper className='ruleInputWarpper colorRuleInputWarpper' menuItems={[
        { key: "selectAll", name: "全选", callback: () => document.execCommand("selectAll") },
        { key: "copy", name: "复制", callback: () => document.execCommand("copy") },
        { key: "cut", name: "剪切", callback: () => document.execCommand("cut") },
        { key: "paste", name: "粘贴", callback: () => document.execCommand("paste") },
    ]}>
        {renderColorList()}
        <TextField className="ruleInput" value={value}
            placeholder={placeholder} style={style} title={title}
            onChange={onChange} onEnter={onEnter} ref={inputRef} />
    </ContextWarpper>
});