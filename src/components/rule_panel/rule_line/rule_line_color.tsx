import React from "react";
import { ruleManager } from "../../../managers/rule_manager";
import { ColorRuleTextField, RegexTextField, RuleLineWarpper } from "./wappers";

export const RuleLine_Color = function ({ index, enable, reg, background, color, regexEnable, onFontColorChange, onBackColorChange, onRegChange }: {
    index: number, enable: boolean, reg: string, regexEnable: boolean,
    background: string | undefined, color: string | undefined,
    onFontColorChange: (index: number, color: string) => void,
    onBackColorChange: (index: number, color: string) => void,
    /**匹配串发生输入变更时的回调函数 */ onRegChange: (index: number, reg: string) => void,
}) {
    const renderReg = () => {
        const rule = ruleManager.colorRules[index];
        return <div className="ruleBlock" title="根据输入的正则表达式匹配日志条目">
            <RegexTextField fieldName="匹配串" value={reg} placeholder="输入匹配串"
                regexEnable={regexEnable} style={{ color: rule?.color, backgroundColor: rule?.background }}
                onChange={(text) => onRegChange(index, text)}
                onEnter={(text) => ruleManager.setReg("color", index, text)}
                onRegexEnableChange={(enable) => ruleManager.setRegexEnable("color", index, enable)}
            />
        </div>
    }

    const renderBackColor = () => {
        return <div className="ruleBlock colorRuleBlock"
            title="满足匹配条件的日志将应用选取的背景色，可以填写xml格式颜色字符串">
            背景色
            <ColorRuleTextField placeholder="选择背景色" value={background}
                onChange={(text) => onBackColorChange(index, text)}
                onEnter={(text) => ruleManager.setRuleBackgroundColor(index, text)} />
        </div>
    }

    const renderFontColor = () => {
        return <div className="ruleBlock colorRuleBlock"
            title="满足匹配条件的日志将应用选取的字体色，可以填写xml格式颜色字符串">
            字体色
            <ColorRuleTextField placeholder="选择字体色" value={color}
                onChange={(text) => onFontColorChange(index, text)}
                onEnter={(text) => ruleManager.setRuleFontColor(index, text)} />
        </div>
    }

    const ruleUp = () => ruleManager.switchRules("color", index, index - 1);
    const ruleDown = () => ruleManager.switchRules("color", index, index + 1);
    const enableRule = () => ruleManager.setEnable("color", index, !enable);
    const deleteRule = () => ruleManager.removeRule("color", index);

    return <RuleLineWarpper key={index} index={index} enable={enable} rules={ruleManager.colorRules}
        onRuleDelete={deleteRule} onRuleDown={ruleDown} onRuleEnable={enableRule} onRuleUp={ruleUp}>
        {renderReg()} {renderBackColor()} {renderFontColor()}
    </RuleLineWarpper>
}