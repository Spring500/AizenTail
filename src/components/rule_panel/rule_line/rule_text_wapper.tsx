import * as React from 'react';
import { EditorableTextField } from '../../common/text_field';
import { DropdownWarpper } from '../../common/dropdown';

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

    return <>{renderColorList()}
        <EditorableTextField value={value} placeholder={placeholder} style={style} title={title}
            onChange={onChange} onEnter={onEnter} ref={inputRef} />
    </>
});

export const RegexTextField = React.forwardRef(function ({ fieldName, value, placeholder, style, title, onChange, onEnter }: {
    fieldName: string, value: string | undefined, placeholder?: string, style?: React.CSSProperties, title?: string,
    onChange: (value: string) => void, onEnter?: (value: string) => void,
}, ref: React.Ref<HTMLInputElement> | undefined) {
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
            value && new RegExp(value);
            setErrorMsg("");
        } catch (e) {
            let message = '正则表达式错误';
            if (e instanceof Error) {
                message = value
                    ? e.message.replace(`/${value}/:`, '')
                    : e.message;
            }
            setErrorMsg(message);
        }
    }, [value]);


    const renderHint = () => {
        if (!errorMsg || !isEditing) return;
        return <div style={{ position: 'relative', height: "100%" }}>
            <div className='fieldHint'
                style={{ position: 'absolute', bottom: "100%", left: 0, color: 'red' }}>{errorMsg}</div>
        </div >;
    }

    return <>
        <span style={{ color: !!errorMsg ? "red" : undefined, }}>{fieldName}</span>
        {renderHint()}
        <EditorableTextField value={value} placeholder={placeholder} title={title}
            onChange={onChange} onEnter={onEnter} ref={inputRef}
            style={{ ...style, border: !!errorMsg ? "1px solid red" : "1px solid #ffffff00" }} />
    </>
});