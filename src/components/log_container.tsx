import React from 'react';
import { FixedSizeList } from "react-window";
import { logManager } from "../log_manager";

class LogRow extends React.Component<{
    index: number, highlightLine: number,
    style: React.CSSProperties
}> {
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
        return <div className="log" style={{ ...this.props.style }} onClick={onClick} >
            <div className="logIndex">{line >= 0 ? line : ''}</div>
            <div className="logText" style={{ backgroundColor: background, color }}>{logText}</div>
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

export class LogContainer extends React.Component<{}, {
    logCount: number,
    highlightLine: number,
    componentHeight: number,
}> {
    private logListRef = React.createRef<FixedSizeList>();
    private logContainerRef = React.createRef<HTMLDivElement>();

    constructor(props: {}) {
        super(props);
        this.state = { logCount: 0, highlightLine: -1, componentHeight: 300 };
    }

    public componentDidMount() {
        logManager.onSetLogCount = (logCount) => this.setState({ logCount });
        logManager.onSetHighlightLine = (highlightLine) => this.setState({ highlightLine });
        logManager.onScrollToItem = (index) => this.logListRef.current?.scrollToItem(index, 'start');
        logManager.logListRef = this.logListRef;

        const div = this.logContainerRef.current;
        if (!div) return;

        const resize = new ResizeObserver(() => this.setState({ componentHeight: div.getBoundingClientRect().height }));
        // 传入监听对象
        resize.observe(div);
        // 及时销毁监听函数（重要!!!）
        this.componentWillUnmount = () => { resize.unobserve(this.logContainerRef?.current!); };
    }

    public render() {
        return <div className="logContainer" ref={this.logContainerRef}>
            <FixedSizeList className="logList"
                ref={this.logListRef} itemData={{ ItemRenderer: LogRow, highlightLine: this.state.highlightLine }}
                height={this.state.componentHeight} itemCount={this.state.logCount} itemSize={17} width={"auto"} overscanCount={30}>
                {ItemWrapper}
            </FixedSizeList>
        </div>
    }
}