import React from "react";
import { ruleManager } from "../../../managers/rule_manager";
import { TextField } from "../../common/text_field";

export class RuleLine_Filter extends React.Component<{
    index: number, enable: boolean, reg: string | undefined, regHasError: boolean, exclude: boolean,
    onRegChange: (index: number, reg: string) => void,
}> {
    public renderReg() {
        return <div className="ruleBlock" title="根据输入的正则表达式匹配日志条目">
            <p style={{ color: this.props.regHasError ? "red" : undefined }}>{this.props.exclude ? "排除" : "包含"}匹配串</p>
            <TextField className="ruleInput" value={this.props.reg} placeholder="输入匹配串"
                style={{ border: this.props.regHasError ? "1px solid red" : "1px solid #ffffff00" }}
                onChange={(value) => this.props.onRegChange(this.props.index, value)}
                onEnter={(value) => ruleManager.setReg("filter", this.props.index, value)} />
        </div>
    }
    public render() {
        const index = this.props.index;
        return <div key={index} className="ruleLine">
            <div className="fixedRuleBlock" title="是否启用该规则"> 启用
                <input type="checkbox" checked={this.props.enable} onChange={(e) => ruleManager.setEnable("filter", index, e.target.checked)} />
            </div>
            {this.renderReg()}
            <div className="fixedRuleBlock" title="满足该条匹配规则的日志将被筛除还是保留"> 反向筛选
                <input type="checkbox" checked={this.props.exclude} onChange={(e) => {
                    ruleManager.filterRules[index].exclude = e.target.checked;
                    ruleManager.refreshRules();
                }} />
            </div>
            <div className="fixedRuleBlock">
                <button className="ruleButton" onClick={() => ruleManager.switchRules("filter", index, index - 1)}
                    title="将该条规则上移一行" disabled={this.props.index <= 0}>上移</button>
                <button className="ruleButton" onClick={() => ruleManager.switchRules("filter", index, index + 1)}
                    title="将该条规则下移一行" disabled={this.props.index >= ruleManager.filterRules.length - 1}>下移</button>
                <button className="ruleButton" onClick={() => ruleManager.removeRule("filter", index)}
                    title="删除该条规则">删除</button>
            </div>
        </div>
    }
}