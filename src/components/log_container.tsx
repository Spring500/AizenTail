import React from 'react';
import { FixedSizeList } from "react-window";
import { logManager } from "../managers/log_manager";

const HIGHLIGHT_STYLE = { background: "gray", color: "var(--theme-color-info-text-highlight)" };
const HIGHLIGHT_INDEX_COLOR = "var(--theme-color-log)";
const EXCLUDED_OPACITY = 0.3;

const splitLog = function (text: string, keywords: string[]) {
    let splitedText = text;
    for (const keyword of keywords) {
        splitedText = splitedText.replace(new RegExp(`(${keyword})`, "gi"), "\x01\x02$1\x01");
    }
    return splitedText.split("\x01").map((text) => {
        if (text[0] !== "\x02") return <>{text}</>
        return <span style={{ color: 'black', background: 'yellow' }}>{text.substring(1)}</span>
    });
}

const LogRow = function ({ index, style, highlightLine }: { index: number, style: React.CSSProperties, highlightLine: number }) {
    const logText = logManager.getLogText(index);
    const line = logManager.indexToLine(index);
    const isHighlight = line >= 0 && line === highlightLine;
    const { background, color } = isHighlight ? HIGHLIGHT_STYLE : logManager.getLogColor(logText);
    const isExculed = logManager.isDisableFilter() && !logManager.lineToIndexMap.has(index);
    const onClick = () => logManager.setHighlightLine(line !== highlightLine ? line : -1);
    return <div className="log" style={{ ...style, opacity: isExculed ? EXCLUDED_OPACITY : undefined }} onClick={onClick} >
        <div className="logIndex" style={{ color: isHighlight ? HIGHLIGHT_INDEX_COLOR : undefined }}>{line >= 0 ? line : ''}</div>
        <div className="logText" style={{ backgroundColor: background, color, whiteSpace: "pre" }}>{
            splitLog(logText, logManager.inputFilters)}<br /></div>
    </div >
}

export const ItemWrapper = function ({ data, index, style }: {
    data: { ItemRenderer: React.ComponentType<{ index: number, style: React.CSSProperties, highlightLine: number }>, highlightLine: number },
    index: number, style: React.CSSProperties
}) {
    return <data.ItemRenderer index={index} style={style} highlightLine={data.highlightLine} />;
}

export const LogContainer = function ({ style }: { style?: React.CSSProperties }) {
    const mainRef = React.createRef<HTMLDivElement>();
    const listRef = React.createRef<FixedSizeList>();
    const [logCount, setLogCount] = React.useState(0);
    const [highlightLine, setHighlightLine] = React.useState(-1);
    const [componentHeight, setComponentHeight] = React.useState(300);
    const onHeightChange = () => {
        const height = mainRef.current?.getBoundingClientRect().height ?? 300;
        setComponentHeight(height);
    }
    React.useEffect(() => {
        logManager.onSetLogCount = setLogCount;
        logManager.onSetHighlightLine = setHighlightLine;
        logManager.onScrollToItem = (index) => listRef.current?.scrollToItem(index, "smart");

        if (mainRef.current) {
            const observer = new ResizeObserver(onHeightChange);
            observer.observe(mainRef.current);
            return () => observer.disconnect();
        }
    }, [mainRef]);

    return <div className="logContainer" ref={mainRef} style={style}>
        <FixedSizeList
            ref={listRef} itemData={{ ItemRenderer: LogRow, highlightLine }}
            style={{ overflow: "scroll" }}
            height={componentHeight} itemCount={logCount} itemSize={17} width={"auto"} overscanCount={3}>
            {ItemWrapper}
        </FixedSizeList>
    </div>
}