import React from "react";
import { ruleManager } from "../../../managers/rule_manager";
import { ContextWarpper } from "../../common/context_wapper";
import { RuleTextField } from "./rule_text_wapper";

export const RuleLine_Filter = function ({ index, enable, reg, regHasError, exclude, onRegChange }: {
    index: number, enable: boolean, reg: string,
    regHasError: boolean, exclude: boolean,
    onRegChange: (index: number, reg: string) => void,
}) {
    const renderReg = () => {
        return <div className="ruleBlock" title="根据输入的正则表达式匹配日志条目">
            <span style={{ color: regHasError ? "red" : undefined }}>{exclude ? "排除" : "包含"}匹配串</span>
            <RuleTextField value={reg} placeholder="输入匹配串"
                style={{ border: regHasError ? "1px solid red" : "1px solid #ffffff00" }}
                onChange={(value) => onRegChange(index, value)}
                onEnter={(value) => ruleManager.setReg("filter", index, value)} />
        </div>
    }

    const ruleUp = () => ruleManager.switchRules("filter", index, index - 1);
    const ruleDown = () => ruleManager.switchRules("filter", index, index + 1);
    const enableRule = () => ruleManager.setEnable("filter", index, !enable);
    const deleteRule = () => ruleManager.removeRule("filter", index);
    const toggleExclude = () => {
        ruleManager.filterRules[index].exclude = !exclude;
        console.log(ruleManager.filterRules[index], ruleManager.filterRules[index].exclude, exclude);
        ruleManager.refreshRules();
        console.log(ruleManager.filterRules[index], ruleManager.filterRules[index].exclude, exclude);
    }

    return <ContextWarpper key={index} menuItems={[
        { key: "up", name: "上移规则", disabled: index <= 0, callback: ruleUp },
        { key: "down", name: "下移规则", disabled: index >= ruleManager.colorRules.length - 1, callback: ruleDown },
        { key: "enable", name: () => enable ? "禁用规则" : "启用规则", callback: enableRule },
        { key: "exclude", name: () => exclude ? "包含匹配串" : "排除匹配串", callback: toggleExclude },
        { key: "del", name: "删除规则", callback: deleteRule },

    ]}>
        <div key={index} className="ruleLine">
            <button className={enable ? "ruleButton activatedButton" : "ruleButton"}
                onClick={enableRule} title="是否启用该规则"> 启用</button>
            {renderReg()}
            <div className="fixedRuleBlock">
                <button className={exclude ? "ruleButton activatedButton" : "ruleButton"}
                    onClick={toggleExclude} title="满足该条匹配规则的日志将被筛除还是保留"
                    disabled={index <= 0}>反向筛选</button>
                <button className="ruleButton" onClick={ruleUp} title="将该条规则上移一行"
                    disabled={index <= 0}>上移</button>
                <button className="ruleButton" onClick={ruleDown} title="将该条规则下移一行"
                    disabled={index >= ruleManager.filterRules.length - 1}>下移</button>
                <button className="ruleButton" onClick={deleteRule} title="删除该条规则">删除</button>
            </div>
        </div>
    </ContextWarpper >
}