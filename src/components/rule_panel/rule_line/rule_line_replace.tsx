import React from "react";
import { ruleManager } from "../../../managers/rule_manager";
import { TextField } from "../../common/text_field";
import { ContextItem } from "../../common/contextItem";

const EXCLUDED_OPACITY = 0.3;

export const RuleLine_Replace = function ({ index, enable, reg, regHasError, replace, onRegChange, onReplaceChange }: {
    index: number, enable: boolean, reg: string,
    regHasError: boolean, replace: string,
    /**匹配串发生输入变更时的回调函数 */ onRegChange: (index: number, reg: string) => void,
    /**替换串发生输入变更时的回调函数 */ onReplaceChange: (index: number, replace: string) => void,
}) {
    const renderReg = () => {
        return <div className="ruleBlock" title="根据输入的正则表达式匹配日志条目"
            style={{ opacity: enable ? undefined : EXCLUDED_OPACITY }}>
            <p style={{ color: regHasError ? "red" : undefined }}>匹配串</p>
            <TextField className="ruleInput" value={reg} placeholder="输入匹配串"
                style={{ border: regHasError ? "1px solid red" : "1px solid #ffffff00" }}
                onChange={(value) => onRegChange(index, value)}
                onEnter={(value) => ruleManager.setReg("replace", index, value)} />
        </div>
    }

    const renderReplace = () => {
        return <div className="ruleBlock"
            title="将根据正则表达式匹配得到的字符串替换显示为对应的字符串。用$1、$2...等分别表示与正则表达式中的第1、2...个子表达式相匹配的文本"
            style={{ opacity: enable ? undefined : EXCLUDED_OPACITY }}>
            替换串
            <TextField className="ruleInput" value={replace} placeholder="替换"
                onChange={(value) => onReplaceChange(index, value)}
                onEnter={(value) => ruleManager.setRuleReplace(index, value)} />
        </div>
    }

    const ruleUp = () => ruleManager.switchRules("replace", index, index - 1);
    const ruleDown = () => ruleManager.switchRules("replace", index, index + 1);
    const enableRule = () => ruleManager.setEnable("replace", index, !enable);
    const deleteRule = () => ruleManager.removeRule("replace", index);

    return <ContextItem key={index} menuItems={[
        { key: "up", name: "上移规则", disabled: index <= 0, callback: ruleUp },
        { key: "down", name: "下移规则", disabled: index >= ruleManager.replaceRules.length - 1, callback: ruleDown },
        { key: "enable", name: () => enable ? "禁用规则" : "启用规则", callback: enableRule },
        { key: "del", name: "删除规则", callback: deleteRule },
    ]}>
        <div className="ruleLine">
            <button className={enable ? "ruleButton activatedButton" : "ruleButton"}
                onClick={enableRule} title="是否启用该规则"> 启用</button>
            {renderReg()}
            {renderReplace()}
            <div className="fixedRuleBlock">
                <button className="ruleButton" onClick={ruleUp} title="将该条规则上移一行"
                    disabled={index <= 0}>上移</button>
                <button className="ruleButton" onClick={ruleDown} title="将该条规则下移一行"
                    disabled={index >= ruleManager.replaceRules.length - 1}>下移</button>
                <button className="ruleButton" onClick={deleteRule} title="删除该条规则">删除</button>
            </div>
        </div>
    </ContextItem>
}