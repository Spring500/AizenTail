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
            const menuRect = dropdownRef.current?.getBoundingClientRect();
            // 先检查点击位置是否在菜单内，如果在则不隐藏菜单
            if (!menuRect || isInRect(menuRect, event.clientX, event.clientY))
                return;
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
    const renderItem = (item: ItemType, index: number) => {
        const disabled = !!item.disabled;
        return <button className='menuDropdownButton' key={index}
            disabled={disabled} onClick={item.callback}>
            {typeof item.name === 'string' ? item.name : item.name()}
        </button>
    }

    if (!visible) return null;
    return <ul className='menuDropdown'
        ref={dropdownRef}
        style={{
            ...style,
            display: visible ? 'flex' : 'none',
            flexDirection: "column",
            listStyleType: "none",
        }}>
        {items.map((item, index) => renderItem(item, index))}
    </ul>

});
