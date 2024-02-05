import React from 'react';
import { FixedSizeList } from "react-window";
import { ILogManager } from "../managers/log_manager";

const HIGHLIGHT_STYLE = { backgroundColor: "gray", color: "var(--theme-color-info-text-highlight)" };
const HIGHLIGHT_INDEX_COLOR = "var(--theme-color-log)";

const splitLog = function (text: string, keywords: string[]) {
    let splitedText = text;
    for (const keyword of keywords) {
        const plainedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        splitedText = splitedText.replace(new RegExp(`(${plainedKeyword})`, "gi"), "\x01\x02$1\x01");
    }
    return splitedText.split("\x01").map((text, index) => {
        if (text[0] !== "\x02") return <span key={index}>{text}</span >
        return <span className='logSearchHit' key={index}>{text.substring(1)}</span>
    });
}

const LogRow = function ({ index, style, highlightLine, manager }: {
    index: number, style: React.CSSProperties, highlightLine: number, manager: ILogManager
}) {
    const logText = manager.getLogText(index);
    const line = manager.indexToLine(index);
    const isExculed = manager.isDisableFilter() && !manager.lineToIndexMap.has(index);
    const isHighlight = line >= 0 && line === highlightLine;
    const lineStyle = isHighlight ? HIGHLIGHT_STYLE : manager.getLogColor(logText);
    const onClick = () => manager.setHighlightLine(line !== highlightLine ? line : -1);

    return <div className="log" style={style} onClick={onClick} >
        <div className="logIndex" style={{ color: isHighlight ? HIGHLIGHT_INDEX_COLOR : undefined }}>{line >= 0 ? line : ''}</div>
        <div className="logText" style={{ ...lineStyle, whiteSpace: "pre" }}>{splitLog(logText, manager.inputFilters)}<br /></div>
    </div >
}

type TRendderData<T> = { ItemRenderer: React.ComponentType<{ index: number, style: React.CSSProperties } & T> } & T;
export const ItemWrapper = function ({ data, index, style }: {
    data: TRendderData<{ highlightLine: number, manager: ILogManager, }>,
    index: number, style: React.CSSProperties
}) {
    return <data.ItemRenderer index={index} style={style} highlightLine={data.highlightLine} manager={data.manager} />;
}

export const LogContainer = function ({ style, manager }: { style?: React.CSSProperties, manager: ILogManager }) {
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
        manager.onSetLogCount = setLogCount;
        manager.onSetHighlightLine = setHighlightLine;
        manager.onScrollToItem = (index) => listRef.current?.scrollToItem(index, "smart");

        if (mainRef.current) {
            const observer = new ResizeObserver(onHeightChange);
            observer.observe(mainRef.current);
            return () => observer.disconnect();
        }
    }, [mainRef]);

    return <div className="logContainer" ref={mainRef} style={style}>
        <FixedSizeList
            ref={listRef} itemData={{ ItemRenderer: LogRow, highlightLine, manager }}
            style={{ overflow: "scroll" }}
            height={componentHeight} itemCount={logCount} itemSize={17} width={"auto"} overscanCount={3}>
            {ItemWrapper}
        </FixedSizeList>
    </div>
}