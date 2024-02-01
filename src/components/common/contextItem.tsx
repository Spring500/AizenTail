import React from "react";
import { Dropdown, ItemType } from "./dropdown";

function isInRect(rect: DOMRect | undefined, x: number, y: number) {
    if (!rect) return false;
    return x >= rect.left && x <= rect.left + rect.width && y >= rect.top && y <= rect.top + rect.height;
}

function adjustMenuPosition(list: HTMLUListElement | null, position: { x: number, y: number }) {
    if (!list) return;
    const style = list.style;
    const rect = list.getBoundingClientRect();

    style.left = `${position.x}px`;
    style.top = `${position.y}px`;
    style.position = "fixed";

    const right = rect.left + rect.width;
    const bottom = rect.top + rect.height;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    if (right > windowWidth) style.left = `${windowWidth - rect.width}px`;
    if (bottom > windowHeight) style.top = `${windowHeight - rect.height}px`;
}


export const ContextItem = function (props: {
    children: React.ReactNode, key: React.Key | null | undefined, className?: string,
    menuItems: ItemType[]
}) {
    const selfRef = React.useRef<HTMLDivElement>(null);
    const menuRef = React.useRef<HTMLUListElement>(null);
    const [clickPos, setClickPos] = React.useState({ x: 0, y: 0 });
    const [menuVisible, setMenuVisible] = React.useState(false);

    React.useEffect(() => {
        if (!selfRef.current) return;
        // 当右键点击该行时，显示右键菜单
        const onContextmenu = (event: MouseEvent) => {
            // 检查事件点击对象是否在该行内
            const x = event.clientX;
            const y = event.clientY;
            if (!isInRect(selfRef.current?.getBoundingClientRect(), x, y))
                return;
            setClickPos({ x, y });
            setMenuVisible(true);
        }
        const timeout = setTimeout(() => document.addEventListener('contextmenu', onContextmenu), 0);
        return () => {
            clearTimeout(timeout);
            document.removeEventListener('contextmenu', onContextmenu);
        }
    }, [selfRef]);

    React.useEffect(() => {
        if (menuVisible) adjustMenuPosition(menuRef.current, clickPos);
    }, [menuRef, menuVisible, clickPos]);

    return <div key={props.key} ref={selfRef} className={props.className}> {props.children}
        <Dropdown ref={menuRef} visible={menuVisible}
            onClickOutside={() => setMenuVisible(false)}
            items={props.menuItems.map(item => {
                return {
                    ...item, callback: () => {
                        item.callback();
                        setMenuVisible(false);
                    }
                };
            })}
            style={{ position: "absolute", right: 0, top: 0 }} />
    </div>
};
