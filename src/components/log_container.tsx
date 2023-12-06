import React from 'react';
import { FixedSizeList } from "react-window";
import { logManager } from "../log_manager";

function Component_LogRow({ index = 0, style }: {
    index?: number,
    style: React.CSSProperties
}) {
    const logText = logManager.getReplacedLogLine(index);
    const { background, color } = logManager.getLogColor(logText);
    return <div className="log" style={{ ...style, backgroundColor: background, color }}>
        <div className="logIndex">{index}</div> {logText}
    </div >
}

function Component_ItemWrapper({ data, index, style }: {
    data: { ItemRenderer: React.ComponentType<{ index: number, style: React.CSSProperties }> },
    index: number,
    style: React.CSSProperties,
}) {
    return <data.ItemRenderer index={index} style={style} />;
};

export function Component_LogContainer() {
    const [logCount, setLogCount] = React.useState(0);
    const [componentHeight, setComponentHeight] = React.useState(300);
    const logListRef = React.useRef<FixedSizeList>(null);
    const logContainerRef = React.useRef<HTMLDivElement>(null);

    logManager.onSetLogCount = setLogCount;
    logManager.onScrollToItem = (index) => logListRef.current?.scrollToItem(index, 'start');

    React.useEffect(() => {
        const div = logContainerRef.current;
        if (!div) return;

        const resize = new ResizeObserver(() => setComponentHeight(div.getBoundingClientRect().height));
        // 传入监听对象
        resize.observe(logContainerRef.current);
        // 及时销毁监听函数（重要!!!）
        return () => { resize.unobserve(logContainerRef?.current!); };
    }, []);

    return <div className="logContainer" ref={logContainerRef}>
        <FixedSizeList className="logList"
            ref={logListRef} itemData={{ ItemRenderer: Component_LogRow }}
            height={componentHeight} itemCount={logCount} itemSize={17} width={""} overscanCount={30}>
            {Component_ItemWrapper}
        </FixedSizeList>
    </div>
}