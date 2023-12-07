import React from 'react';
import { FixedSizeList } from "react-window";
import { logManager } from "../log_manager";

function Component_LogRow({ index = 0, highlightLine = -1, style }: {
    index?: number,
    highlightLine?: number,
    style: React.CSSProperties
}) {
    const logText = logManager.getLogText(index);
    const line = logManager.indexToLine(index);
    const { background, color } = line === highlightLine
        ? { background: "gray", color: "white" }
        : logManager.getLogColor(logText);
    const onClick = () => {
        console.log("click", line);
        if (line === highlightLine) logManager.setHighlightLine(-1);
        else logManager.setHighlightLine(line);
    }
    return <div className="log" style={{ ...style, backgroundColor: background, color }} onClick={onClick}>
        <div className="logIndex">{line}</div> {logText}
    </div >
}

function Component_ItemWrapper({ data, index, style }: {
    data: { ItemRenderer: React.ComponentType<{ index: number, style: React.CSSProperties, highlightLine: number }>, highlightLine: number },
    index: number,
    style: React.CSSProperties,
}) {
    return <data.ItemRenderer index={index} style={style} highlightLine={data.highlightLine} />;
};

export function Component_LogContainer() {
    const [logCount, setLogCount] = React.useState(0);
    const [highlightLine, setHighlightLine] = React.useState(-1);
    const [componentHeight, setComponentHeight] = React.useState(300);
    const logListRef = React.useRef<FixedSizeList>(null);
    const logContainerRef = React.useRef<HTMLDivElement>(null);

    logManager.onSetLogCount = setLogCount;
    logManager.onSetHighlightLine = setHighlightLine;
    logManager.onScrollToItem = (index) => logListRef.current?.scrollToItem(index, 'start');
    logManager.logListRef = logListRef;

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
            ref={logListRef} itemData={{ ItemRenderer: Component_LogRow, highlightLine }}
            height={componentHeight} itemCount={logCount} itemSize={17} width={"auto"} overscanCount={30}>
            {Component_ItemWrapper}
        </FixedSizeList>
    </div>
}