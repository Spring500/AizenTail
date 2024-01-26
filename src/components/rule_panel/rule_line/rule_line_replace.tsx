import React from "react";
import { ruleManager } from "../../../managers/rule_manager";
import { TextField } from "../../common/text_field";

export class RuleLine_Replace extends React.Component<{
    index: number, enable: boolean, reg: string, regHasError: boolean, replace: string,
    /**匹配串发生输入变更时的回调函数 */ onRegChange: (index: number, reg: string) => void,
    /**替换串发生输入变更时的回调函数 */ onReplaceChange: (index: number, replace: string) => void,
}> {
    private renderReg() {
        return <div className="ruleBlock" title="根据输入的正则表达式匹配日志条目">
            <p style={{ color: this.props.regHasError ? "red" : undefined }}>匹配串</p>
            <TextField className="ruleInput" value={this.props.reg} placeholder="输入匹配串"
                style={{ border: this.props.regHasError ? "1px solid red" : "1px solid #ffffff00" }}
                onChange={(value) => this.props.onRegChange(this.props.index, value)}
                onEnter={(value) => ruleManager.setReg("replace", this.props.index, value)} />
        </div>
    }

    private renderReplace() {
        return <div className="ruleBlock" title="将根据正则表达式匹配得到的字符串替换显示为对应的字符串。用$1、$2...等分别表示与正则表达式中的第1、2...个子表达式相匹配的文本">
            替换串
            <TextField className="ruleInput" value={this.props.replace} placeholder="替换"
                onChange={(value) => this.props.onReplaceChange(this.props.index, value)}
                onEnter={(value) => ruleManager.setRuleReplace(this.props.index, value)} />
        </div>
    }

    public render() {
        const index = this.props.index;
        return <div key={index} className="ruleLine">
            <div className="fixedRuleBlock" title="是否启用该规则"> 启用
                <input type="checkbox" checked={this.props.enable} onChange={(e) => ruleManager.setEnable("replace", index, e.target.checked)} />
            </div>
            {this.renderReg()}
            {this.renderReplace()}
            <div className="fixedRuleBlock">
                <button className="ruleButton" onClick={() => ruleManager.switchRules("replace", index, index - 1)}
                    title="将该条规则上移一行" disabled={this.props.index <= 0}>上移</button>
                <button className="ruleButton" onClick={() => ruleManager.switchRules("replace", index, index + 1)}
                    title="将该条规则下移一行" disabled={this.props.index >= ruleManager.replaceRules.length - 1}>下移</button>
                <button className="ruleButton" onClick={() => ruleManager.removeRule("replace", index)}
                    title="删除该条规则">删除</button>
            </div>
        </div>
    }
}