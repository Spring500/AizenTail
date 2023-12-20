import React from "react";
import { ruleManager } from "../../../managers/rule_manager";
import { TextField } from "../../common/text_field";

export class RuleLine_Replace extends React.Component<{
    index: number, enable: boolean, reg: string, regHasError: boolean, replace: string,
    /**匹配串发生输入变更时的回调函数 */ onRegChange: (index: number, reg: string) => void,
    /**替换串发生输入变更时的回调函数 */ onReplaceChange: (index: number, replace: string) => void,
}> {
    private renderReg() {
        return <div className="ruleBlock"> <p style={{ color: this.props.regHasError ? "red" : undefined }}>匹配串</p>
            <TextField className="ruleInput" value={this.props.reg}
                style={{ border: this.props.regHasError ? "1px solid red" : "1px solid #ffffff00" }}
                onChange={(value) => this.props.onRegChange(this.props.index, value)}
                onEnter={(value) => ruleManager.setReg("replace", this.props.index, value)} />
        </div>
    }

    private renderReplace() {
        return <div className="ruleBlock"> 替换串
            <TextField className="ruleInput" value={this.props.replace}
                onChange={(value) => this.props.onReplaceChange(this.props.index, value)}
                onEnter={(value) => ruleManager.setRuleReplace(this.props.index, value)} />
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
                <button className="ruleButton" onClick={() => ruleManager.switchRules("replace", index, index - 1)}
                    disabled={this.props.index <= 0}>上移</button>
                <button className="ruleButton" onClick={() => ruleManager.switchRules("replace", index, index + 1)}
                    disabled={this.props.index >= ruleManager.replaceRules.length - 1}>下移</button>
                <button className="ruleButton" onClick={() => ruleManager.removeRule("replace", index)}>删除</button>
            </div>
        </div>
    }
}