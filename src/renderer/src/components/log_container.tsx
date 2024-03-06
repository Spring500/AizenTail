import { ILogManager } from "../managers/log_manager";
import { IListView, ListView } from './common/list';
import { ContextWarpper } from './common/context_wapper';
import { useEffect, useState } from "react";
import { createRef } from "react";

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

export const LogContainer = function (props: {
    style?: React.CSSProperties,
    manager: ILogManager,
    isFiltering: boolean,
    isAutoScroll: boolean,
    isShowHoverText: boolean,
    onChangeFile: (file: File | null) => void,
    replaceRules: ReplaceConfig[],
    colorRules: ColorConfig[],
    filterRules: FilterConfig[],
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
            props.onChangeFile(event.dataTransfer.files[0]);
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


    const scrollToItem = function (index: number) {
        listRef.current?.scrollToItem(index, "center", "instant");
    }

    const onTick = function () {
        props.manager.refreshFile();
    }
    // 监听manager的变化
    useEffect(() => {
        const manager = props.manager;
        if (!manager) return;
        manager.onSetLogCount = setLogCount;
        const timer = setInterval(onTick, 100);
        return () => {
            if (manager.onSetLogCount === setLogCount)
                manager.onSetLogCount = null;
            clearInterval(timer);
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

    useEffect(() => {
        if (!props.isAutoScroll) return;
        if (highlightLine !== -1) {
            const index = props.manager.lineToIndex(highlightLine);
            if (index !== -1) scrollToItem(index)
        } else {
            scrollToItem(props.isFiltering
                ? props.manager.filtedLogIds.length - 1
                : props.manager.logs.length - 1);
        }
    }, [logCount, props.isFiltering]);

    const rexCache = new Map<string, RegExp | undefined>();
    const getRegExp = function (matchText: string): RegExp | undefined {
        let res = rexCache.get(matchText);
        if (!res) {
            try { res = new RegExp(matchText, "gi"); }
            catch { }
            finally { rexCache.set(matchText, res); }
        } else res.lastIndex = 0;
        return res;
    }

    // 替换日志
    const replaceLog = function (rawText: string) {
        let text = rawText ?? "";
        for (const rule of props.replaceRules) {
            if (!rule.enable) continue;
            if (rule.regexEnable) {
                const reg = getRegExp(rule.reg);
                if (reg) text = text.replace(reg, rule.replace);
            } else {
                if (text.includes(rule.reg)) text = text.replace(rule.reg, rule.replace);
            }
        }
        return text;
    }

    // 获取日志颜色
    const getLogColor = function (log: string) {
        for (const rule of props.colorRules) {
            if (!rule.enable) continue;
            if (rule.regexEnable) {
                if (!getRegExp(rule.reg)?.test(log)) continue;
            } else {
                if (!log.includes(rule.reg)) continue;
            }
            return {
                backgroundColor: rule.background,
                color: rule.color,
            };
        };
        return {};
    }

    const hasFilter = props.filterRules.length > 0 && props.filterRules.some(rule => rule.enable);

    const LogRowRenderer = function (index: number) {
        const manager = props.manager;
        const logText = replaceLog(manager.getLogText(index));
        const line = props.manager.indexToLine(index);
        const isExculed = !props.isFiltering && hasFilter && !manager.lineToIndexMap.has(index);
        const isHighlight = line >= 0 && line === highlightLine;
        const onClick = () => setHighlightLine(line !== highlightLine ? line : -1);

        return <ContextWarpper menuItems={[
            { key: "select", name: "选择", callback: () => setHighlightLine(line) },
            { key: "copy", name: "复制", callback: () => navigator.clipboard.writeText(logText) }
        ]}>
            <div className="log" style={{ ...props.style, opacity: isExculed ? EXCLUDED_OPACITY : undefined }} onClick={onClick} >
                <div className="logIndex">{line >= 0 ? line : ''}</div>
                <div className={`logText${isHighlight ? ' highlightLogText' : ''}`}
                    title={props.isShowHoverText ? logText : undefined}
                    style={{ ...getLogColor(logText), whiteSpace: "pre" }}>
                    {splitLog(logText, manager.inputFilters)}<br /></div>
            </div >
        </ContextWarpper>
    }
    return <div className="logContainer" ref={mainRef} style={{ ...props.style, position: 'relative' }}>
        <ListView ref={listRef} style={{ height: "100%", inset: "0%" }}
            itemRender={LogRowRenderer} count={logCount} itemHeight={17} />
        {dragging && <div className='logContainerMask' style={{ zIndex: 100 }}>
            拖曳至此打开日志文件 </div>}
    </div>
}