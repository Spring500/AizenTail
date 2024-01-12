import React from 'react';
import { FixedSizeList } from "react-window";
import { logManager } from "../managers/log_manager";

class LogRow extends React.Component<{ index: number, highlightLine: number, style: React.CSSProperties }> {
    public render() {
        const index = this.props.index;
        const logText = logManager.getLogText(index);
        const line = logManager.indexToLine(index);
        const { background, color } = line >= 0 && line === this.props.highlightLine
            ? { background: "gray", color: "white" }
            : logManager.getLogColor(logText);
        const onClick = () => {
            console.log("click", line);
            if (line === this.props.highlightLine) logManager.setHighlightLine(-1);
            else logManager.setHighlightLine(line);
        }
        const isExculed = logManager.isDisableFilter() && !logManager.lineToIndexMap.has(index);
        return <div className="log" style={{
            ...this.props.style,
            opacity: isExculed ? 0.3 : 1,
        }} onClick={onClick} >
            <div className="logIndex">{line >= 0 ? line : ''}</div>
            <div className="logText" style={{ backgroundColor: background, color, whiteSpace: "pre" }}>{logText}<br /></div>
        </div >
    }
}

class ItemWrapper extends React.Component<{
    data: { ItemRenderer: React.ComponentType<{ index: number, style: React.CSSProperties, highlightLine: number }>, highlightLine: number },
    index: number,
    style: React.CSSProperties,
}> {
    public render() {
        return <this.props.data.ItemRenderer index={this.props.index} style={this.props.style} highlightLine={this.props.data.highlightLine} />;
    }
}

export class LogContainer extends React.Component<
    { style?: React.CSSProperties },
    { logCount: number, highlightLine: number, componentHeight: number }
> {
    private logListRef = React.createRef<FixedSizeList>();
    private logContainerRef = React.createRef<HTMLDivElement>();
    private observer: ResizeObserver | undefined;

    constructor(props: {}) {
        super(props);
        this.state = { logCount: 0, highlightLine: -1, componentHeight: 300 };
    }

    lastResizeTime = 0;
    ResizeTimer: NodeJS.Timeout | null = null;
    protected onHeightChange() {
        const now = Date.now();
        if (now - this.lastResizeTime < 50) {
            this.ResizeTimer && clearTimeout(this.ResizeTimer);
            this.ResizeTimer = setTimeout(() => {
                const height = this.logContainerRef.current?.getBoundingClientRect().height ?? 300;
                this.setState({ componentHeight: height });
                this.lastResizeTime = now;
            }, 50);
        } else {
            const height = this.logContainerRef.current?.getBoundingClientRect().height ?? 300;
            this.setState({ componentHeight: height });
            this.lastResizeTime = now;
        }
    }

    public componentDidMount() {
        logManager.onSetLogCount = (logCount) => this.setState({ logCount });
        logManager.onSetHighlightLine = (highlightLine) => this.setState({ highlightLine });
        logManager.onScrollToItem = (index) => this.logListRef.current?.scrollToItem(index, "smart");

        const div = this.logContainerRef.current;
        if (!div) return;

        this.observer = new ResizeObserver(this.onHeightChange.bind(this));
        this.observer.observe(div);
    }

    public componentWillUnmount() {
        this.observer?.disconnect();
    }

    public render() {
        return <div className="logContainer" ref={this.logContainerRef} style={{ ...this.props.style }}>
            <FixedSizeList
                ref={this.logListRef} itemData={{ ItemRenderer: LogRow, highlightLine: this.state.highlightLine }}
                style={{ overflow: "scroll" }}
                height={this.state.componentHeight} itemCount={this.state.logCount} itemSize={17} width={"auto"} overscanCount={30}>
                {ItemWrapper}
            </FixedSizeList>
        </div>
    }
}