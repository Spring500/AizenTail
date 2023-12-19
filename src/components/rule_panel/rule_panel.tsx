import React from "react";
import { ruleManager } from "../../managers/rule_manager";
import { checkRegExp } from "../../utils";
import { RuleLine_Color, RuleLine_Replace, RuleLine_Filter } from "./rule_line";


export class RulePanel extends React.Component<{},
    { ruleCount: number, colorRules: ColorConfig[], replaceRules: ReplaceConfig[], filterRules: FilterConfig[] }
> {
    private ruleContainerRef = React.createRef<HTMLDivElement>();

    constructor(props: {}) {
        super(props);
        this.state = { ruleCount: 0, colorRules: [], replaceRules: [], filterRules: [] };
    }


    private loadSetting() {
        const colorRules: ColorConfig[] = [];
        for (const rule of ruleManager.colorRules) {
            colorRules.push({ reg: rule.reg, background: rule.background, color: rule.color, enable: rule.enable, index: rule.index });
        }
        this.setState({ colorRules });
        const replaceRules: ReplaceConfig[] = [];
        for (const rule of ruleManager.replaceRules) {
            replaceRules.push({ reg: rule.reg, replace: rule.replace, enable: rule.enable, index: rule.index });
        }
        this.setState({ replaceRules: replaceRules });
        const filterRules = [];
        for (const rule of ruleManager.filterRules) {
            filterRules.push(rule);
        }
        this.setState({ filterRules });
    }


    public componentDidMount() {
        ruleManager.onRuleChanged = () => {
            this.setState({ ruleCount: ruleManager.getRuleCount() });
            this.loadSetting();
        }

        this.setState({ ruleCount: ruleManager.getRuleCount() });
        this.loadSetting();
        const div = this.ruleContainerRef.current;
        if (!div) return;
    }

    public componentWillUnmount() {
        ruleManager.onRuleChanged = null;
    }

    private renderColorRuleList() {
        const onRegChange = (index: number, reg: string) => {
            this.setState({ colorRules: this.state.colorRules.map(rule => rule.index === index ? { ...rule, reg } : rule) });
        }
        const onAddRule = () => { ruleManager.addRule("color"); }
        const rules = this.state.colorRules;
        return <><div className="ruleTitleText">颜色规则</div>
            {rules.map(rule => {
                const index = rule.index;
                return <RuleLine_Color key={index} index={index} onRegChange={onRegChange}
                    enable={rule.enable ?? false} reg={rule.reg ?? ""} regHasError={!checkRegExp(rule.reg)}
                    background={rule.background} color={rule.color}
                />
            })}
            <div className="ruleLine"><button className="ruleButton" onClick={onAddRule}>添加规则</button></div>
            <datalist id="colorList">
                <option value="white" />
                <option value="red" />
                <option value="yellow" />
                <option value="gray" />
                <option value="black" />
                <option value="#FF00FF" />
                <option value="#FFFF00" />
                <option value="#FFFFFF" />
            </datalist></>
    }


    private renderReplaceRuleList() {
        const onRegChange = (index: number, reg: string) => {
            this.setState({ replaceRules: this.state.replaceRules.map(rule => rule.index === index ? { ...rule, reg } : { ...rule }) });
        }
        const onReplaceChange = (index: number, replace: string) => {
            this.setState({ replaceRules: this.state.replaceRules.map(rule => rule.index === index ? { ...rule, replace } : rule) });
        }
        const onAddRule = () => { ruleManager.addRule("replace"); }
        return <><div className="ruleTitleText">替换规则</div>
            {this.state.replaceRules.map(rule =>
                <RuleLine_Replace key={rule.index} index={rule.index} onRegChange={onRegChange} onReplaceChange={onReplaceChange}
                    enable={rule.enable ?? false} reg={rule.reg} regHasError={!checkRegExp(rule.reg)} replace={rule.replace}
                />
            )}
            <div className="ruleLine"><button className="ruleButton" onClick={onAddRule}>添加规则</button></div>
        </>;
    }

    private renderFilterRuleList() {
        const onRegChange = (index: number, reg: string) => {
            this.setState({ filterRules: this.state.filterRules.map(rule => rule.index === index ? { ...rule, reg } : rule) });
        }
        const onAddRule = () => { ruleManager.addRule("filter"); }
        return <><div className="ruleTitleText">过滤规则</div>
            {this.state.filterRules.map(rule =>
                <RuleLine_Filter key={rule.index} index={rule.index} onRegChange={onRegChange} exclude={rule.exclude ?? false}
                    enable={rule.enable ?? false} reg={rule.reg} regHasError={!checkRegExp(rule.reg)}
                />
            )}
            <div className="ruleLine"><button className="ruleButton" onClick={onAddRule}>添加规则</button></div>
        </>;
    }

    public render() {
        return <div className="ruleContainer" ref={this.ruleContainerRef} >
            {this.renderColorRuleList()}
            {this.renderReplaceRuleList()}
            {this.renderFilterRuleList()}
        </div>
    }
}