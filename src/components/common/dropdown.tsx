import * as React from 'react';

function checkIsInRect(rect: DOMRect, x: number, y: number) {
    return x >= rect.left && x <= rect.left + rect.width && y >= rect.top && y <= rect.top + rect.height;
}

export const Dropdown = function ({ visible, items, style, onClickOutside }: {
    visible: boolean,
    items: { key: string, name: string | (() => string), callback: (...args: any[]) => any }[],
    onClickOutside?: (event: MouseEvent) => void,
    style?: React.CSSProperties
}) {
    const dropdownRef = React.useRef<HTMLUListElement>(null);
    // 当点击其它位置时，隐藏菜单
    React.useEffect(() => {
        if (!visible || !dropdownRef.current) return;
        const onClick = (event: MouseEvent) => {
            const menu = dropdownRef.current;
            // 先检查点击位置是否在菜单内，如果在则不隐藏菜单
            if (!menu || checkIsInRect(menu.getBoundingClientRect(), event.clientX, event.clientY)) return;
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
    return <div style={{ position: "relative", width: "auto", height: "100%" }}>
        <ul className='menuDropdown'
            ref={dropdownRef}
            style={{ ...style, display: visible ? 'block' : 'none', position: "absolute", listStyleType: "none" }}>
            {items.map(item => <li key={item.key}><button className='menuDropdownButton' onClick={item.callback}>{
                typeof item.name === 'string' ? item.name : item.name()
            }</button></li>)}
        </ul>
    </div>
}
