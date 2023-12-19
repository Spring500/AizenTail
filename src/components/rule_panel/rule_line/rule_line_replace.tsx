import React from "react";
import { ruleManager } from "../../../managers/rule_manager";

export class RuleLine_Replace extends React.Component<{
    index: number, enable: boolean, reg: string, regHasError: boolean, replace: string,
    /**匹配串发生输入变更时的回调函数 */ onRegChange: (index: number, reg: string) => void,
    /**替换串发生输入变更时的回调函数 */ onReplaceChange: (index: number, replace: string) => void,
}> {
    private renderReg() {
        return <div className="ruleBlock"> 匹配串
            <input className="ruleInput" type="text" value={this.props.reg}
                style={{ border: this.props.regHasError ? "1px solid red" : undefined }}
                onChange={(e) => this.props.onRegChange(this.props.index, e.target.value)}
                onBlur={(e) => ruleManager.setReg("replace", this.props.index, e.target.value)} />
        </div>
    }

    private renderReplace() {
        return <div className="ruleBlock"> 替换串
            <input className="ruleInput" type="text" value={this.props.replace}
                onChange={(e) => this.props.onReplaceChange(this.props.index, e.target.value)}
                onBlur={(e) => ruleManager.setRuleReplace(this.props.index, e.target.value)} />
        </div>
    }

    public render() {
        const index = this.props.index;
        return <div key={index} className="ruleLine">
            <div className="fixedRuleBlock"> 启用
                <input type="checkbox" checked={this.props.enable} onChange={(e) => ruleManager.setEnable("replace", index, e.target.checked)} />
            </div>
            {this.renderReg()}
            {this.renderReplace()}
            <div className="fixedRuleBlock">
                <button className="ruleButton" onClick={() => ruleManager.switchRules("replace", index, index - 1)}>上移</button>
                <button className="ruleButton" onClick={() => ruleManager.switchRules("replace", index, index + 1)}>下移</button>
                <button className="ruleButton" onClick={() => ruleManager.removeRule("replace", index)}>删除</button>
            </div>
        </div>
    }
}