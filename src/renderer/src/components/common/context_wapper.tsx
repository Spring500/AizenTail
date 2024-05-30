import React from 'react'
import { Dropdown, ItemType } from './dropdown'

function adjustMenuPosition(menu: HTMLUListElement | null, position: { x: number; y: number }) {
    if (!menu) return
    const style = menu.style
    const rect = menu.getBoundingClientRect()

    // 检查菜单是否超出屏幕，如果未超出则生成在鼠标右下
    // 如果超出底边但未超出右边界，则生成在鼠标右上
    // 如果超出右边界但未超出底边，则生成在鼠标左下
    // 如果超出右边界且超出底边，则生成在鼠标左上
    const winWidth = window.innerWidth
    const winHeight = window.innerHeight
    const menuWidth = rect.width
    const menuHeight = rect.height
    const x = position.x
    const y = position.y
    if (x + menuWidth <= winWidth) {
        style.left = x + 'px'
    } else {
        style.left = x - menuWidth + 'px'
    }
    if (y + menuHeight <= winHeight) {
        style.top = y + 'px'
    } else {
        style.top = y - menuHeight + 'px'
    }
}

export const ContextWarpper = function (props: {
    children: React.ReactNode
    className?: string
    menuItems: ItemType[]
}) {
    const selfRef = React.useRef<HTMLDivElement>(null)
    const menuRef = React.useRef<HTMLUListElement>(null)
    const [clickPos, setClickPos] = React.useState({ x: 0, y: 0 })
    const [menuVisible, setMenuVisible] = React.useState(false)

    // 当右键点击该行时，显示右键菜单
    const onContextmenu: React.MouseEventHandler<HTMLDivElement> = (event) => {
        const holder = selfRef.current
        if (!holder || !(event.target instanceof HTMLElement)) return
        // 检查事件点击对象是否是该行的子对象
        if (!(event.target instanceof HTMLElement) || !holder.contains(event.target as Node)) return
        // 检查事件点击对象是否在该行内
        const x = event.clientX
        const y = event.clientY

        setClickPos({ x, y })
        event.stopPropagation()
        setMenuVisible(true)
        document.dispatchEvent(new Event('menuOpened'))
    }

    React.useEffect(() => {
        if (!menuVisible) return
        const onOtherMenuOpened = () => {
            setMenuVisible(false)
        }
        document.addEventListener('menuOpened', onOtherMenuOpened, { once: true })
        adjustMenuPosition(menuRef.current, { x: clickPos.x + 5, y: clickPos.y + 5 })

        return () => document.removeEventListener('menuOpened', onOtherMenuOpened)
    }, [menuRef, menuVisible, clickPos])

    const renderDropdown = () => {
        if (!menuVisible) return
        return (
            <Dropdown
                ref={menuRef}
                visible={true}
                onClickOutside={() => setMenuVisible(false)}
                items={props.menuItems.map((item) => {
                    return {
                        ...item,
                        callback: () => {
                            item.callback()
                            setMenuVisible(false)
                        }
                    }
                })}
                style={{ position: 'fixed', left: 0, top: 0 }}
            />
        )
    }

    return (
        <span ref={selfRef} className={props.className} onContextMenu={onContextmenu}>
            {props.children}
            {renderDropdown()}
        </span>
    )
}
