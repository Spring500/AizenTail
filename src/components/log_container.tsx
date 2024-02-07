import React from 'react';
import { ILogManager } from "../managers/log_manager";
import { IListView, ListView } from './common/list';

const HIGHLIGHT_STYLE = { backgroundColor: "gray", color: "var(--theme-color-info-text-highlight)" };
const HIGHLIGHT_INDEX_COLOR = "var(--theme-color-log)";
const EXCLUDED_OPACITY = 0.3;

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

export const LogContainer = function ({ style, manager, onChangeFile }: {
    style?: React.CSSProperties, manager: ILogManager, onChangeFile: (file: File | null) => void
}) {
    const mainRef = React.createRef<HTMLDivElement>();
    const listRef = React.createRef<IListView>();
    const [dragging, setDragging] = React.useState(false);
    const [logCount, setLogCount] = React.useState(0);
    const [highlightLine, setHighlightLine] = React.useState(-1);

    const onDrop = (event: DragEvent) => {
        event.preventDefault();
        event.stopPropagation();
        setDragging(false);
        if (event.dataTransfer && event.dataTransfer.files.length > 0)
            onChangeFile(event.dataTransfer.files[0]);
    }

    const onDragOver = (event: DragEvent) => {
        event.preventDefault();
        event.stopPropagation();
    }

    const inRect = (x: number, y: number) => {
        const rect = mainRef.current?.getBoundingClientRect();
        return rect && x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    }

    const onDragEnter = (event: DragEvent) => {
        event.preventDefault();
        event.stopPropagation();
        if (dragging) return;
        // 检查当前鼠标位置是否在容器内
        if (inRect(event.clientX, event.clientY)) {
            setDragging(true);
        }
    }

    const onDragLeave = (event: DragEvent) => {
        event.preventDefault();
        event.stopPropagation();
        if (!dragging) return;
        // 检查当前鼠标位置是否在容器内
        if (!inRect(event.clientX, event.clientY)) {
            setDragging(false);
        }
    }

    React.useEffect(() => {
        manager.onSetLogCount = setLogCount;
        manager.onSetHighlightLine = setHighlightLine;
        manager.onScrollToItem = (index) => listRef.current?.scrollToItem(index, "smart");

        const current = mainRef.current;
        if (current) {
            mainRef.current.addEventListener("drop", onDrop);
            current.addEventListener("dragover", onDragOver);
            current.addEventListener("dragleave", onDragLeave);
            current.addEventListener("dragenter", onDragEnter);
        }
        return () => {
            current?.removeEventListener("drop", onDrop);
            current?.removeEventListener("dragover", onDragOver);
            current?.removeEventListener("dragleave", onDragLeave);
            current?.removeEventListener("dragenter", onDragEnter);
        }
    }, [mainRef]);

    const LogRowRenderer = function (index: number) {
        const logText = manager.getLogText(index);
        const line = manager.indexToLine(index);
        const isExculed = manager.isDisableFilter() && !manager.lineToIndexMap.has(index);
        const isHighlight = line >= 0 && line === highlightLine;
        const lineStyle = isHighlight ? HIGHLIGHT_STYLE : manager.getLogColor(logText);
        const onClick = () => manager.setHighlightLine(line !== highlightLine ? line : -1);

        return <div className="log" style={{ ...style, opacity: isExculed ? EXCLUDED_OPACITY : undefined }} onClick={onClick} >
            <div className="logIndex" style={{ color: isHighlight ? HIGHLIGHT_INDEX_COLOR : undefined }}>{line >= 0 ? line : ''}</div>
            <div className="logText" style={{ ...lineStyle, whiteSpace: "pre" }}>{splitLog(logText, manager.inputFilters)}<br /></div>
        </div >
    }

    return <div className="logContainer" ref={mainRef} style={{ ...style, position: 'relative' }}>
        <ListView ref={listRef} style={{ height: "100%", inset: "0%" }}
            itemRender={LogRowRenderer} count={logCount} itemHeight={17} />
        {dragging && <div className='logContainerMask' style={{
            position: 'absolute', inset: "0%", zIndex: 100, display: 'flex',
            justifyContent: 'center', alignItems: 'center',
        }}> 拖曳至此打开日志文件 </div>}
    </div>
}