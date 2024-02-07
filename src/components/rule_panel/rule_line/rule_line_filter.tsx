import React from "react";
import { ruleManager } from "../../../managers/rule_manager";
import { RegexTextField, RuleLineWarpper } from "./wappers";

export const RuleLine_Filter = function ({ index, enable, reg, exclude, onRegChange, regexEnable }: {
    index: number, enable: boolean, reg: string, exclude: boolean, regexEnable: boolean,
    onRegChange: (index: number, reg: string) => void,
}) {
    const renderReg = () => {
        return <div className="ruleBlock" title="根据输入的正则表达式匹配日志条目">
            <RegexTextField fieldName={`${exclude ? "排除" : "包含"}匹配串`}
                value={reg} placeholder="输入匹配串" regexEnable={regexEnable}
                onChange={(value) => onRegChange(index, value)}
                onEnter={(value) => ruleManager.setReg("filter", index, value)}
                onRegexEnableChange={(enable) => ruleManager.setRegexEnable("filter", index, enable)} />
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

    return <RuleLineWarpper key={index} index={index} enable={enable} rules={ruleManager.filterRules}
        onRuleDelete={deleteRule} onRuleDown={ruleDown} onRuleEnable={enableRule} onRuleUp={ruleUp}
        menuItems={[{ key: "exclude", name: () => exclude ? "包含匹配串" : "排除匹配串", callback: toggleExclude }]}>
        {renderReg()}
        <div className="fixedRuleBlock">
            <button className={exclude ? "ruleButton activatedButton" : "ruleButton"}
                onClick={toggleExclude} title="满足该条匹配规则的日志将被筛除还是保留"
                disabled={index <= 0}>反向筛选</button>
        </div>
    </RuleLineWarpper >
}