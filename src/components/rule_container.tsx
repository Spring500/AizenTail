import React from "react";
import { FixedSizeList } from "react-window";
import { ruleManager } from "../managers/rule_manager";

class RuleItem extends React.Component<{
    index: number, highlightLine: number,
    style: React.CSSProperties
}> {
    public render() {
        const index = this.props.index;
        const rule = ruleManager.getRules()[index];
        const { background, color } = index >= 0 && index === this.props.highlightLine
            ? { background: "gray", color: "white" }
            : { background: "white", color: "black" };
        const onClick = () => {
            console.log("click", index);
            if (index === this.props.highlightLine) ruleManager.setHighlightLine(-1);
            else ruleManager.setHighlightLine(index);
        }
        return <div className="log" style={{ ...this.props.style }} onClick={onClick} >
            <div className="logIndex">{index >= 0 ? index : ''}</div>
            <div className="logText" style={{ backgroundColor: background, color }}>{rule.reg.source}</div>
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

export class RuleContainer extends React.Component<{}, {
    ruleCount: number,
    highlightLine: number,
    componentHeight: number,
}> {
    private ruleListRef = React.createRef<FixedSizeList>();
    private ruleContainerRef = React.createRef<HTMLDivElement>();
    private observer: ResizeObserver | undefined;

    constructor(props: {}) {
        super(props);
        this.state = { ruleCount: 0, highlightLine: -1, componentHeight: 300 };
    }

    lastResizeTime = 0;
    ResizeTimer: NodeJS.Timeout | null = null;
    protected onHeightChange() {
        const now = Date.now();
        if (now - this.lastResizeTime < 50) {
            this.ResizeTimer && clearTimeout(this.ResizeTimer);
            this.ResizeTimer = setTimeout(() => {
                const height = this.ruleContainerRef.current?.getBoundingClientRect().height ?? 300;
                this.setState({ componentHeight: height });
                this.lastResizeTime = now;
            }, 50);
        } else {
            const height = this.ruleContainerRef.current?.getBoundingClientRect().height ?? 300;
            this.setState({ componentHeight: height });
            this.lastResizeTime = now;
        }
    }

    public componentDidMount() {
        ruleManager.onSetRuleCount = (ruleCount) => this.setState({ ruleCount });
        ruleManager.onSetHighlightLine = (highlightLine) => this.setState({ highlightLine });
        ruleManager.onScrollToItem = (index) => this.ruleListRef.current?.scrollToItem(index, "smart");

        const div = this.ruleContainerRef.current;
        if (!div) return;

        this.observer = new ResizeObserver(this.onHeightChange.bind(this));
        this.observer.observe(div);
    }

    public componentWillUnmount() {
        this.observer?.disconnect();
    }

    public render() {
        return <div className="ruleContainer" ref={this.ruleContainerRef} >
            <FixedSizeList
                ref={this.ruleListRef}
                height={this.state.componentHeight}
                itemCount={this.state.ruleCount}
                itemSize={20}
                width="100%"
                itemData={{ ItemRenderer: RuleItem, highlightLine: this.state.highlightLine }}
            >
                {ItemWrapper}
            </FixedSizeList>
        </div>
    }
}