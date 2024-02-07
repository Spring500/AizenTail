import React from "react";

export type IListView = {
    scrollToItem: (index: number, align: "auto" | "smart" | "center" | "end" | "start") => void;
};

export const ListView = React.forwardRef((props: {
    itemRender: (index: number) => React.ReactNode;
    count: number; itemHeight: number;
    style: React.CSSProperties;
}, ref: React.Ref<IListView> | undefined) => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [containerHeight, setContainerHeight] = React.useState(0);
    const [scrollProgress, setScrollProgress] = React.useState(0);

    React.useImperativeHandle(ref, () => {
        return {
            scrollToItem: (index, align) => {
                const container = containerRef.current;
                if (!container) return;
                let top = container.scrollTop;
                const itemHeight = props.itemHeight;
                switch (align) {
                    case "smart":
                        if (index * itemHeight < container.scrollTop)
                            top = index * itemHeight;
                        else if ((index + 1) * itemHeight > container.scrollTop + container.clientHeight)
                            top = (index + 1) * itemHeight - container.clientHeight;
                        break;
                    case "center":
                        top = index * itemHeight - container.clientHeight / 2 + itemHeight / 2;
                        break;
                    case "end":
                        top = (index + 1) * itemHeight - container.clientHeight;
                        break;
                    case "start":
                    case "auto":
                    default:
                        top = index * itemHeight;
                        break;
                }
                container.scrollTo({ top, behavior: "instant" });
            }
        };
    });

    React.useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        const observer = new ResizeObserver(() => {
            setContainerHeight(container.clientHeight);
        });
        observer.observe(container);
        return () => observer.disconnect();
    }, [containerRef]);

    const renderItems = () => {
        // 只渲染可见的部分
        const start = Math.floor(scrollProgress * props.count);
        const visibleCount = Math.ceil(containerHeight / props.itemHeight) + 3;
        const end = Math.min(start + visibleCount, props.count);
        const items = [];
        for (let i = start; i < end; i++) {
            items.push(<div key={i} style={{ position: "absolute", top: i * props.itemHeight, width: "100%" }}>
                {props.itemRender(i)}
            </div>);
        }
        return items;
    };

    const onScroll = (event: React.UIEvent<HTMLDivElement>) => {
        let progress = event.currentTarget.scrollTop / event.currentTarget.scrollHeight;
        progress = Math.max(0, Math.min(progress, 1));
        setScrollProgress(progress);
    }
    return <div style={{ ...props.style, overflow: "scroll", position: "relative" }}
        onScroll={onScroll} ref={containerRef}>
        <div style={{ height: props.itemHeight * props.count, }} />
        {renderItems()}
    </div>;
}) 