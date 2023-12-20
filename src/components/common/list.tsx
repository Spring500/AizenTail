import React from "react";

class ListRowWarpper extends React.Component<{
    index: number,
    rowHeight: number,
    top: number,
    rowRenderer: (index: number) => React.ReactNode,
}, {
    }> {
    constructor(props: any) {
        super(props);
    }

    public render() {
        return <div style={{
            position: "relative",
            left: "0px",
            top: this.props.top,
            height: this.props.rowHeight,
            width: "100%",
        }}>
            {this.props.rowRenderer(this.props.index)}
        </div>;
    }
}

export class ListView extends React.Component<{
    className?: string,
    id?: string,
    overscanCount?: number,
    count: number,
    rowHeight: number,
    rowRenderer: (index: number) => React.ReactNode,
    onScroll?: (scrollTop: number) => void,
    style?: React.CSSProperties,
}, {
    scrollTop: number,
    viewHeight: number,
}> {
    constructor(props: any) {
        super(props);
        this.state = { scrollTop: 0, viewHeight: 0 };
    }
    private listRef = React.createRef<HTMLDivElement>();
    private listContainerRef = React.createRef<HTMLDivElement>();
    private resizeObserver: ResizeObserver | undefined;

    public get scrollTop() {
        return this.listRef.current?.scrollTop ?? 0;
    }

    public componentDidMount(): void {
        this.onHeightChange();
        this.resizeObserver = new ResizeObserver(() => {
            this.onHeightChange();
        });
        this.resizeObserver.observe(this.listRef.current!);
    }

    public componentWillUnmount(): void {
        this.resizeObserver?.disconnect();
    }

    public scrollToItem(index: number) {
        if (this.listRef.current) {
            this.listRef.current.scrollTop = (index - this.getOverscanCount()) * this.props.rowHeight;
        }
    }

    public getCurrentScrollIndex() {
        let count = this.props.count - Math.ceil(this.state.viewHeight / this.props.rowHeight);
        if (count <= 0) return 0;
        let height = this.getVirtualHeight() - this.state.viewHeight;
        return Math.floor(this.getCurrentScrollTop() / height * count);
    }

    public getCurrentScrollTop() {
        return Math.max(Math.min(this.scrollTop, this.getVirtualHeight() - this.state.viewHeight), 0);
    }

    public getOverscanCount() {
        return this.props.overscanCount ?? 3;
    }

    protected createRows() {
        const count = this.props.count;
        const totalHeight = this.getVirtualHeight();
        const scrollTop = this.getCurrentScrollTop();

        let startIndex = this.getCurrentScrollIndex() - this.getOverscanCount();
        startIndex = Math.max(Math.min(startIndex, count - 1), 0);

        let endIndex = startIndex + Math.ceil(this.state.viewHeight / this.props.rowHeight) + this.getOverscanCount() * 2;
        endIndex = Math.min(endIndex, count);

        let startTop = scrollTop - (scrollTop % this.props.rowHeight) - this.getOverscanCount() * this.props.rowHeight;

        const result: React.ReactNode[] = [];
        // 获取当前组件相对于页面的y坐标
        for (let i = startIndex; i < endIndex; i++) {
            result.push(<ListRowWarpper
                key={i} index={i}
                top={startTop}
                rowHeight={this.props.rowHeight}
                rowRenderer={this.props.rowRenderer} />);
        }
        return result;
    }

    public getVirtualHeight() {
        return Math.min(this.props.count * this.props.rowHeight, this.state.viewHeight * 1000);
    }

    public render() {
        return <div
            className={this.props.className}
            id={this.props.id}
            style={{ overflow: 'scroll', ...this.props.style }}
            ref={this.listRef} onScroll={this.onScroll}>
            <div
                style={{ height: this.getVirtualHeight() }}
                ref={this.listContainerRef}>
                {this.createRows()}
            </div>
        </div>;
    }

    lastResizeTime = 0;
    resizeTimer: NodeJS.Timeout | null = null;
    protected onHeightChange() {
        const now = Date.now();
        this.resizeTimer && clearTimeout(this.resizeTimer);
        this.resizeTimer = setTimeout(() => {
            const height = this.listRef.current?.getBoundingClientRect().height ?? 300;
            this.setState({ viewHeight: height });
            this.lastResizeTime = now;
            this.resizeTimer = null;
        }, 50);
    }

    lastScrollTime = 0;
    scrollTimer: NodeJS.Timeout | null = null;
    protected onScroll = () => {
        const now = Date.now();
        if (now - this.lastScrollTime < 50) {
            this.scrollTimer && clearTimeout(this.scrollTimer);
            this.scrollTimer = setTimeout(this.onScroll.bind(this), 50);
        }
        this.lastScrollTime = now;
        this.props.onScroll?.(this.listRef.current!.scrollTop);
        this.setState({ scrollTop: this.listRef.current!.scrollTop });
    }
}