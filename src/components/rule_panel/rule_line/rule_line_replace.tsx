import React from "react";
import { ruleManager } from "../../../managers/rule_manager";
import { EditorableTextField } from "../../common/text_field";
import { RegexTextField, RuleLineWarpper } from "./wappers";

export const RuleLine_Replace = function ({ index, enable, reg, replace, onRegChange, onReplaceChange }: {
    index: number, enable: boolean, reg: string, replace: string,
    /**匹配串发生输入变更时的回调函数 */ onRegChange: (index: number, reg: string) => void,
    /**替换串发生输入变更时的回调函数 */ onReplaceChange: (index: number, replace: string) => void,
}) {
    const renderReg = () => {
        return <div className="ruleBlock" title="根据输入的正则表达式匹配日志条目">
            <RegexTextField fieldName="匹配串" value={reg} placeholder="输入匹配串"
                onChange={(value) => onRegChange(index, value)}
                onEnter={(value) => ruleManager.setReg("replace", index, value)} />
        </div>
    }

    const renderReplace = () => {
        return <div className="ruleBlock"
            title="将根据正则表达式匹配得到的字符串替换显示为对应的字符串。用$1、$2...等分别表示与正则表达式中的第1、2...个子表达式相匹配的文本">
            替换串
            <EditorableTextField value={replace} placeholder="替换"
                onChange={(value) => onReplaceChange(index, value)}
                onEnter={(value) => ruleManager.setRuleReplace(index, value)} />
        </div>
    }

    const ruleUp = () => ruleManager.switchRules("replace", index, index - 1);
    const ruleDown = () => ruleManager.switchRules("replace", index, index + 1);
    const enableRule = () => ruleManager.setEnable("replace", index, !enable);
    const deleteRule = () => ruleManager.removeRule("replace", index);

    return <RuleLineWarpper key={index} index={index} enable={enable} rules={ruleManager.replaceRules}
        onRuleDelete={deleteRule} onRuleDown={ruleDown} onRuleEnable={enableRule} onRuleUp={ruleUp}>
        {renderReg()} {renderReplace()}
    </RuleLineWarpper>
}