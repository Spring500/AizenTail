import React from "react";

export type IListView = {
    scrollToItem: (index: number, align: "auto" | "smart" | "center" | "end" | "start") => void;
    startIndex: number;
    endIndex: number;
};

export const ListView = React.forwardRef((props: {
    itemRender: (index: number) => React.ReactNode;
    count: number; itemHeight: number;
    style: React.CSSProperties; onListScroll?: () => void;
}, ref: React.Ref<IListView> | undefined) => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [containerHeight, setContainerHeight] = React.useState(0);
    const [progress, setProgress] = React.useState(0);

    const visibleStart = Math.floor(progress * props.count);
    const visibleEnd = visibleStart + Math.ceil(containerHeight / props.itemHeight);
    const renderStart = visibleStart - 3;
    const renderEnd = visibleEnd + 3;

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
            },
            startIndex: Math.max(visibleStart, 0),
            endIndex: Math.min(visibleEnd, props.count),
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
        const items = [];
        for (let i = renderStart; i < renderEnd; i++) {
            if (i < 0 || i >= props.count)
                continue;
            items.push(<div key={i} style={{ position: "absolute", top: i * props.itemHeight, width: "100%" }}>
                {props.itemRender(i)}
            </div>);
        }
        return items;
    };

    const onScroll = (event: React.UIEvent<HTMLDivElement>) => {
        let progress = event.currentTarget.scrollTop / event.currentTarget.scrollHeight;
        progress = Math.max(0, Math.min(progress, 1));
        setProgress(progress);
        props.onListScroll?.();
    }
    return <div style={{ ...props.style, overflow: "scroll", position: "relative" }}
        onScroll={onScroll} ref={containerRef}>
        <div style={{ height: props.itemHeight * props.count, }} />
        {renderItems()}
    </div>;
}) 