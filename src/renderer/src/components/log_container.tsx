import { ILogManager } from "../managers/log_manager";
import { IListView, ListView } from './common/list';
import { ContextWarpper } from './common/context_wapper';
import { useEffect, useState } from "preact/hooks";
import { createRef } from "preact";

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
        if (text[0] !== "\x02")
            return <span key={index}>{text}</span >
        return <span className='logSearchHit' key={index}>{text.substring(1)}</span>
    });
}

export const LogContainer = function ({ style, manager, onChangeFile }: {
    style?: preact.JSX.CSSProperties, manager: ILogManager, onChangeFile: (file: File | null) => void
}) {
    const mainRef = createRef<HTMLDivElement>();
    const listRef = createRef<IListView>();
    const [dragging, setDragging] = useState(false);
    const [logCount, setLogCount] = useState(0);
    const [highlightLine, setHighlightLine] = useState(-1);

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

    // 监听高亮行的位置变化
    useEffect(() => {
        const index = manager.lineToIndex(highlightLine);
        if (index < 0) return;
        listRef.current?.scrollToItem(index, "center", 'smooth');
    }, [highlightLine]);

    // 监听manager的变化
    useEffect(() => {
        if (!manager) return;
        manager.onSetLogCount = setLogCount;
        manager.onSetHighlightLine = setHighlightLine;
        manager.onScrollToItem = (index) => listRef.current?.scrollToItem(index, "center");
        return () => {
            if (manager.onSetLogCount === setLogCount)
                manager.onSetLogCount = null;
            if (manager.onSetHighlightLine === setHighlightLine)
                manager.onSetHighlightLine = null;
            if (manager.onScrollToItem === listRef.current?.scrollToItem)
                manager.onScrollToItem = null;
        }
    }, [mainRef]);

    // 监听文件拖放
    useEffect(() => {
        const current = mainRef.current;
        if (!current) return;
        current.addEventListener("drop", onDrop);
        current.addEventListener("dragover", onDragOver);
        current.addEventListener("dragleave", onDragLeave);
        current.addEventListener("dragenter", onDragEnter);

        return () => {
            current.removeEventListener("drop", onDrop);
            current.removeEventListener("dragover", onDragOver);
            current.removeEventListener("dragleave", onDragLeave);
            current.removeEventListener("dragenter", onDragEnter);
        }
    }, [mainRef]);

    const LogRowRenderer = function (index: number) {
        const logText = manager.getLogText(index);
        const line = manager.indexToLine(index);
        const isExculed = manager.isDisableFilter() && !manager.lineToIndexMap.has(index);
        const isHighlight = line >= 0 && line === highlightLine;
        const lineStyle = isHighlight ? HIGHLIGHT_STYLE : manager.getLogColor(logText);
        const onClick = () => manager.setHighlightLine(line !== highlightLine ? line : -1);

        return <ContextWarpper menuItems={[
            { key: "select", name: "选择", callback: () => manager.setHighlightLine(line) },
            { key: "copy", name: "复制", callback: () => navigator.clipboard.writeText(logText) }
        ]}>
            <div className="log" style={{ ...style, opacity: isExculed ? EXCLUDED_OPACITY : undefined }} onClick={onClick} >
                <div className="logIndex" style={{ color: isHighlight ? HIGHLIGHT_INDEX_COLOR : undefined }}>{line >= 0 ? line : ''}</div>
                <div className="logText" style={{ ...lineStyle, whiteSpace: "pre" }}>{splitLog(logText, manager.inputFilters)}<br /></div>
            </div >
        </ContextWarpper>
    }

    return <div className="logContainer" ref={mainRef} style={{ ...style, position: 'relative' }}>
        <ListView ref={listRef} style={{ height: "100%", inset: "0%" }}
            itemRender={LogRowRenderer} count={logCount} itemHeight={17} />
        {dragging && <div className='logContainerMask' style={{ zIndex: 100 }}>
            拖曳至此打开日志文件 </div>}
    </div>
}