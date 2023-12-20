import React from "react";
import { ruleManager } from "../../../managers/rule_manager";
import { TextField } from "../../common/text_field";

export class RuleLine_Filter extends React.Component<{
    index: number, enable: boolean, reg: string | undefined, regHasError: boolean, exclude: boolean,
    onRegChange: (index: number, reg: string) => void,
}> {
    public renderReg() {
        return <div className="ruleBlock"> <p style={{ color: this.props.regHasError ? "red" : undefined }}>{this.props.exclude ? "排除" : "包含"}匹配串</p>
            <TextField className="ruleInput" value={this.props.reg}
                style={{ border: this.props.regHasError ? "1px solid red" : "1px solid #ffffff00" }}
                onChange={(value) => this.props.onRegChange(this.props.index, value)}
                onEnter={(value) => ruleManager.setReg("filter", this.props.index, value)} />
        </div>
    }
    public render() {
        const index = this.props.index;
        return <div key={index} className="ruleLine">
            <div className="fixedRuleBlock"> 启用
                <input type="checkbox" checked={this.props.enable} onChange={(e) => ruleManager.setEnable("filter", index, e.target.checked)} />
            </div>
            {this.renderReg()}
            <div className="fixedRuleBlock"> 反向筛选
                <input type="checkbox" checked={this.props.exclude} onChange={(e) => {
                    ruleManager.filterRules[index].exclude = e.target.checked;
                    ruleManager.refreshRules();
                }} />
            </div>
            <div className="fixedRuleBlock">
                <button className="ruleButton" onClick={() => ruleManager.switchRules("filter", index, index - 1)}
                    disabled={this.props.index <= 0}>上移</button>
                <button className="ruleButton" onClick={() => ruleManager.switchRules("filter", index, index + 1)}
                    disabled={this.props.index >= ruleManager.filterRules.length - 1}>下移</button>
                <button className="ruleButton" onClick={() => ruleManager.removeRule("filter", index)}>删除</button>
            </div>
        </div>
    }
}