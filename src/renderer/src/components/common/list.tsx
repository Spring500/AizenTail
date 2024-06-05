import React from 'react'

export type IListView = {
    scrollToItem: (
        index: number,
        align: 'auto' | 'smart' | 'center' | 'end' | 'start',
        behavior?: 'auto' | 'instant' | 'smooth'
    ) => void
    startIndex: number
    endIndex: number
}

const MAX_DIV_HEIGHT = 999999

export const ListView = React.forwardRef(function ListViewRef(
    props: {
        itemRender: (index: number) => React.ReactNode
        count: number
        itemHeight: number
        style: React.CSSProperties
        onListScroll?: () => void
    },
    ref: React.ForwardedRef<IListView>
) {
    const containerRef = React.useRef<HTMLDivElement>(null)
    const [containerHeight, setContainerHeight] = React.useState(0)
    const [visibleStart, setVisibleStart] = React.useState(0)
    const visibleEnd = visibleStart + Math.ceil(containerHeight / props.itemHeight)

    React.useImperativeHandle(ref, () => {
        return {
            scrollToItem: (index, align, behavior): void => {
                const container = containerRef.current
                if (!container) return
                let topIndex = index
                let top = container.scrollTop
                const itemHeight = props.itemHeight
                const visibleCount = Math.floor(container.clientHeight / itemHeight)
                switch (align) {
                    case 'smart':
                        if (index < visibleStart) {
                            topIndex = index
                        } else if (index >= visibleEnd) {
                            topIndex = index - visibleCount + 1
                        }
                        break
                    case 'center':
                        topIndex = index - Math.floor(visibleCount / 2)
                        break
                    case 'end':
                        topIndex = index - visibleCount + 1
                        break
                    case 'start':
                    case 'auto':
                    default:
                        topIndex = index
                        break
                }
                if (topIndex < 0) topIndex = 0
                top =
                    props.itemHeight * props.count < MAX_DIV_HEIGHT
                        ? topIndex * itemHeight
                        : (top =
                              (topIndex / (props.count - visibleCount)) *
                              (container.scrollHeight - container.clientHeight))
                container.scrollTo({ top, behavior: behavior ?? 'instant' })
            },
            startIndex: Math.max(visibleStart, 0),
            endIndex: Math.min(visibleEnd, props.count)
        }
    })

    React.useEffect(() => {
        const container = containerRef.current
        if (!container) return
        const observer = new ResizeObserver(() => {
            setContainerHeight(container.clientHeight)
        })
        observer.observe(container)
        return (): void => observer.disconnect()
    }, [containerRef])

    const renderItems = (): React.ReactNode => {
        const container = containerRef.current
        if (!container) return
        const renderStart = visibleStart - 3
        const renderEnd = visibleEnd + 3
        // 只渲染可见的部分
        const items: React.ReactNode[] = []
        let visibleOffset = 0
        if (props.itemHeight * props.count >= MAX_DIV_HEIGHT) {
            visibleOffset = container.scrollTop - visibleStart * props.itemHeight
        }
        for (let i = renderStart; i < renderEnd; i++) {
            if (i < 0 || i >= props.count) continue
            const top = Math.min(
                i * props.itemHeight + visibleOffset,
                MAX_DIV_HEIGHT - props.itemHeight
            )
            items.push(
                <div key={i} style={{ position: 'absolute', top, width: '100%' }}>
                    {props.itemRender(i)}
                </div>
            )
        }
        return items
    }

    const onScroll = (): void => {
        const container = containerRef.current
        if (!container) return
        let newVisibleStart = 0
        if (props.itemHeight * props.count < MAX_DIV_HEIGHT) {
            newVisibleStart = Math.floor(container.scrollTop / props.itemHeight)
        } else {
            const inViewCount = Math.ceil(container.clientHeight / props.itemHeight)
            newVisibleStart =
                (container.scrollTop / (container.scrollHeight - container.clientHeight)) *
                (props.count - inViewCount)
            newVisibleStart = Math.floor(newVisibleStart)
        }
        if (newVisibleStart === visibleStart) return
        setVisibleStart(newVisibleStart)
        props.onListScroll?.()
    }

    return (
        <div
            style={{ ...props.style, overflow: 'scroll', position: 'relative' }}
            onScroll={onScroll}
            ref={containerRef}
        >
            <div style={{ height: Math.min(props.itemHeight * props.count, MAX_DIV_HEIGHT) }} />
            {renderItems()}
        </div>
    )
})
