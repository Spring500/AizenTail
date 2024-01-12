import React from "react";
import { ruleManager } from "../../../managers/rule_manager";
import { TextField } from "../../common/text_field";

export class RuleLine_Color extends React.Component<{
    index: number, enable: boolean, reg: string, regHasError: boolean,
    background: string | undefined, color: string | undefined,
    onFontColorChange: (index: number, color: string) => void,
    onBackColorChange: (index: number, color: string) => void,
    /**匹配串发生输入变更时的回调函数 */ onRegChange: (index: number, reg: string) => void,
}> {
    private onEnterBackColor = (color: string) => {
        ruleManager.setRuleBackgroundColor(this.props.index, color);
    }
    private onEnterFontColor = (color: string) => {
        ruleManager.setRuleFontColor(this.props.index, color);
    }

    private renderReg() {
        return <div className="ruleBlock"> <p style={{ color: this.props.regHasError ? "red" : undefined }}>匹配串</p>
            <TextField className="ruleInput" value={this.props.reg} placeholder="输入匹配串"
                style={{
                    color: ruleManager.colorRules[this.props.index]?.color,
                    backgroundColor: ruleManager.colorRules[this.props.index]?.background,
                    border: this.props.regHasError ? "1px solid red" : "1px solid #ffffff00"
                }}
                onChange={(text) => this.props.onRegChange(this.props.index, text)}
                onEnter={(text) => ruleManager.setReg("color", this.props.index, text)} />
        </div>
    }

    private renderBackColor() {
        const color = this.props.background;
        return <div className="ruleBlock"> 背景色
            <TextField className="ruleInput" list="colorList"
                onChange={(text) => this.props.onBackColorChange(this.props.index, text)}
                onEnter={this.onEnterBackColor} placeholder="选择背景颜色" value={color} />
        </div>
    }

    private renderFontColor() {
        const color = this.props.color;
        return <div className="ruleBlock"> 字体色
            <TextField className="ruleInput" list="colorList"
                onChange={(text) => this.props.onFontColorChange(this.props.index, text)}
                onEnter={this.onEnterFontColor} placeholder="选择字体颜色" value={color} />
        </div>
    }

    public render() {
        const index = this.props.index;
        return <div key={index} className="ruleLine">
            <div className="fixedRuleBlock"> 启用
                <input type="checkbox" checked={this.props.enable} onChange={(e) => ruleManager.setEnable("color", index, e.target.checked)} />
            </div>
            {this.renderReg()}
            {this.renderBackColor()}
            {this.renderFontColor()}
            <div className="fixedRuleBlock">
                <button className="ruleButton" onClick={() => ruleManager.switchRules("color", index, index - 1)}
                    disabled={this.props.index <= 0}>上移</button>
                <button className="ruleButton" onClick={() => ruleManager.switchRules("color", index, index + 1)}
                    disabled={this.props.index >= ruleManager.colorRules.length - 1}>下移</button>
                <button className="ruleButton" onClick={() => ruleManager.removeRule("color", index)}>删除</button>
            </div>
        </div>
    }
}