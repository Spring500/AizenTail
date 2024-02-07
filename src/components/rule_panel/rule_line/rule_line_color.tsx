import React from "react";
import { ruleManager } from "../../../managers/rule_manager";
import { ContextWarpper } from "../../common/context_wapper";
import { ColorRuleTextField, RegexTextField } from "./rule_text_wapper";

export const RuleLine_Color = function ({ index, enable, reg, background, color, onFontColorChange, onBackColorChange, onRegChange }: {
    index: number, enable: boolean, reg: string,
    background: string | undefined, color: string | undefined,
    onFontColorChange: (index: number, color: string) => void,
    onBackColorChange: (index: number, color: string) => void,
    /**匹配串发生输入变更时的回调函数 */ onRegChange: (index: number, reg: string) => void,
}) {
    const renderReg = () => {
        const rule = ruleManager.colorRules[index];
        return <div className="ruleBlock" title="根据输入的正则表达式匹配日志条目">
            <RegexTextField fieldName="匹配串" value={reg} placeholder="输入匹配串"
                style={{ color: rule?.color, backgroundColor: rule?.background }}
                onChange={(text) => onRegChange(index, text)}
                onEnter={(text) => ruleManager.setReg("color", index, text)} />
        </div>
    }

    const renderBackColor = () => {
        return <div className="ruleBlock colorRuleBlock"
            title="满足匹配条件的日志将应用选取的背景色，可以填写xml格式颜色字符串">
            背景色
            <ColorRuleTextField
                onChange={(text) => onBackColorChange(index, text)}
                onEnter={(text) => ruleManager.setRuleBackgroundColor(index, text)}
                placeholder="选择背景色" value={background} />
        </div>
    }

    const renderFontColor = () => {
        return <div className="ruleBlock colorRuleBlock"
            title="满足匹配条件的日志将应用选取的字体色，可以填写xml格式颜色字符串">
            字体色
            <ColorRuleTextField
                onChange={(text) => onFontColorChange(index, text)}
                onEnter={(text) => ruleManager.setRuleFontColor(index, text)}
                placeholder="选择字体色" value={color} />
        </div>
    }

    const ruleUp = () => ruleManager.switchRules("color", index, index - 1);
    const ruleDown = () => ruleManager.switchRules("color", index, index + 1);
    const enableRule = () => ruleManager.setEnable("color", index, !enable);
    const deleteRule = () => ruleManager.removeRule("color", index);

    return <ContextWarpper key={index} className="ruleLine" menuItems={[
        { key: "up", name: "上移规则", disabled: index <= 0, callback: ruleUp },
        { key: "down", name: "下移规则", disabled: index >= ruleManager.colorRules.length - 1, callback: ruleDown },
        { key: "enable", name: () => enable ? "禁用规则" : "启用规则", callback: enableRule },
        { key: "del", name: "删除规则", callback: deleteRule },

    ]}>
        <button className={enable ? "ruleButton activatedButton" : "ruleButton"}
            onClick={enableRule} title="是否启用该规则"> 启用</button>
        {renderReg()} {renderBackColor()} {renderFontColor()}
        <div className="fixedRuleBlock">
            <button className="ruleButton" onClick={ruleUp} title="将该条规则上移一行"
                disabled={index <= 0}>上移</button>
            <button className="ruleButton" onClick={ruleDown} title="将该条规则下移一行"
                disabled={index >= ruleManager.colorRules.length - 1}>下移</button>
            <button className="ruleButton" onClick={deleteRule} title="删除该条规则">删除</button>
        </div>
    </ContextWarpper>
}