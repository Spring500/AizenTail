import * as React from 'react';

export type ItemType = { key: string, name: string | (() => string), disabled?: boolean, callback: (...args: any[]) => any };

function isInRect(rect: DOMRect, x: number, y: number) {
    return x >= rect.left && x <= rect.left + rect.width && y >= rect.top && y <= rect.top + rect.height;
}

export const Dropdown = React.forwardRef(function ({ visible, items, style, onClickOutside }: {
    visible: boolean, items: ItemType[], style?: React.CSSProperties,
    onClickOutside?: (event: MouseEvent) => void,
}, ref: React.Ref<HTMLUListElement> | undefined) {
    const dropdownRef = React.useRef<HTMLUListElement>(null);
    // 当点击其它位置时，隐藏菜单
    React.useEffect(() => {
        if (!visible || !dropdownRef.current) return;
        const onClick = (event: MouseEvent) => {
            const menu = dropdownRef.current;
            // 先检查点击位置是否在菜单内，如果在则不隐藏菜单
            if (!menu || isInRect(menu.getBoundingClientRect(), event.clientX, event.clientY)) return;
            onClickOutside?.(event);
        }
        const timeout = setTimeout(() => {
            document.addEventListener('click', onClick);
            document.addEventListener('contextmenu', onClick);
        }, 0);
        return () => {
            clearTimeout(timeout);
            document.removeEventListener('click', onClick);
            document.removeEventListener('contextmenu', onClick);
        }
    }, [dropdownRef, visible]);
    React.useImperativeHandle(ref, () => dropdownRef.current!);
    const renderItem = (item: ItemType) => {
        if (item.disabled !== undefined && item.disabled)
            return <button className='menuDropdownButton' disabled={true}>
                {typeof item.name === 'string' ? item.name : item.name()} </button>
        else
            return <button className='menuDropdownButton' onClick={item.callback}>
                {typeof item.name === 'string' ? item.name : item.name()} </button>
    }

    return <div style={{ position: "relative", width: "auto", height: "100%" }}>
        <ul className='menuDropdown'
            ref={dropdownRef}
            style={{ ...style, display: visible ? 'block' : 'none', position: "absolute", listStyleType: "none" }}>
            {items.map(item => <li key={item.key}>{renderItem(item)}</li>)}
        </ul>
    </div>
});
