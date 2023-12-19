import React from "react";
import { ruleManager } from "../../../managers/rule_manager";

export class RuleLine_Filter extends React.Component<{
    index: number, enable: boolean, reg: string | undefined, exclude: boolean,
    onRegChange: (index: number, reg: string) => void,
}> {
    public render() {
        const index = this.props.index;
        return <div key={index} className="ruleLine">
            <div className="fixedRuleBlock"> 启用
                <input type="checkbox" checked={this.props.enable} onChange={(e) => ruleManager.setEnable("filter", index, e.target.checked)} />
            </div>
            <div className="ruleBlock"> {this.props.exclude ? "排除" : "包含"}匹配串
                <input className="ruleInput" type="text" value={this.props.reg}
                    onChange={(e) => this.props.onRegChange(index, e.target.value)}
                    onBlur={(e) => ruleManager.setReg("filter", this.props.index, e.target.value)} />
            </div>
            <div className="fixedRuleBlock"> 反向筛选
                <input type="checkbox" checked={this.props.exclude} onChange={(e) => {
                    ruleManager.filterRules[index].exclude = e.target.checked;
                    ruleManager.refreshRules();
                }} />
            </div>
            <div className="fixedRuleBlock">
                <button className="ruleButton" onClick={() => ruleManager.switchRules("filter", index, index - 1)}>上移</button>
                <button className="ruleButton" onClick={() => ruleManager.switchRules("filter", index, index + 1)}>下移</button>
                <button className="ruleButton" onClick={() => ruleManager.removeRule("filter", index)}>删除</button>
            </div>
        </div>
    }
}