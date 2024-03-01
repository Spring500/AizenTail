import * as React from 'react';

export type ItemType = { key: string, name: string | (() => string), disabled?: boolean, callback: (...args: any[]) => any };

function isInRect(rect: DOMRect, x: number, y: number) {
    return x >= rect.left && x <= rect.left + rect.width && y >= rect.top && y <= rect.top + rect.height;
}

export const Dropdown = React.forwardRef(function DropdownRef({ visible, items, style, onClickOutside }: {
    visible: boolean, items: ItemType[], style?: React.CSSProperties,
    onClickOutside?: (event: MouseEvent) => void,
}, ref: React.ForwardedRef<HTMLUListElement>) {
    return <DropdownWarpper visible={visible} style={style} onClickOutside={onClickOutside} ref={ref}>
        {items.map((item, index) => {
            const disabled = !!item.disabled;
            return <button className='menuDropdownButton' key={index}
                disabled={disabled} onClick={item.callback}>
                {typeof item.name === 'string' ? item.name : item.name()}
            </button>
        })}
    </DropdownWarpper>;
});

export const DropdownWarpper = React.forwardRef(function DropdownWarpperRef(props: {
    visible: boolean, style?: React.CSSProperties,
    children: React.ReactNode, className?: string,
    onClickOutside?: (event: MouseEvent) => void,
    onOtherDropdownOpen?: () => void,
}, ref: React.ForwardedRef<HTMLUListElement>) {
    const dropdownRef = React.useRef<HTMLUListElement>(null);
    // 当点击其它位置时，隐藏菜单
    React.useEffect(() => {
        if (!props.visible || !dropdownRef.current) return;
        document.dispatchEvent(new Event('openDropdown'));
        const onClick = (event: MouseEvent) => {
            const menuRect = dropdownRef.current?.getBoundingClientRect();
            // 先检查点击位置是否在菜单内，如果在则不隐藏菜单
            if (!menuRect || isInRect(menuRect, event.clientX, event.clientY))
                return;
            props.onClickOutside?.(event);
        }
        const onOtherDropdownOpen = () => {
            props.onOtherDropdownOpen?.();
        }
        const timeout = setTimeout(() => {
            document.addEventListener('click', onClick);
            document.addEventListener('contextmenu', onClick);
            document.addEventListener('openDropdown', onOtherDropdownOpen);
        }, 0);
        return () => {
            clearTimeout(timeout);
            document.removeEventListener('click', onClick);
            document.removeEventListener('contextmenu', onClick);
            document.removeEventListener('openDropdown', onOtherDropdownOpen);
        }
    }, [dropdownRef, props.visible]);
    React.useImperativeHandle(ref, () => dropdownRef.current!);

    return <>{props.visible && <ul className='menuDropdown'
        ref={dropdownRef}
        style={{
            ...props.style,
            display: 'flex',
            flexDirection: "column",
            listStyleType: "none",
        }}>
        {props.children}
    </ul>}</>
});