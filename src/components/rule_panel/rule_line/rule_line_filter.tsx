import React from "react";
import { ruleManager } from "../../../managers/rule_manager";
import { TextField } from "../../common/text_field";
import { ContextItem } from "../../common/contextItem";

export const RuleLine_Filter = function ({ index, enable, reg, regHasError, exclude, onRegChange }: {
    index: number, enable: boolean, reg: string, regHasError: boolean, exclude: boolean,
    onRegChange: (index: number, reg: string) => void,
}) {
    const renderReg = () => {
        return <div className="ruleBlock" title="根据输入的正则表达式匹配日志条目">
            <p style={{ color: regHasError ? "red" : undefined }}>{exclude ? "排除" : "包含"}匹配串</p>
            <TextField className="ruleInput" value={reg} placeholder="输入匹配串"
                style={{ border: regHasError ? "1px solid red" : "1px solid #ffffff00" }}
                onChange={(value) => onRegChange(index, value)}
                onEnter={(value) => ruleManager.setReg("filter", index, value)} />
        </div>
    }

    const ruleUp = () => ruleManager.switchRules("filter", index, index - 1);
    const ruleDown = () => ruleManager.switchRules("filter", index, index + 1);
    const enableRule = () => ruleManager.setEnable("filter", index, !enable);
    const deleteRule = () => ruleManager.removeRule("filter", index);

    return <ContextItem key={index} menuItems={[
        { key: "up", name: "上移规则", disabled: index <= 0, callback: ruleUp },
        { key: "down", name: "下移规则", disabled: index >= ruleManager.colorRules.length - 1, callback: ruleDown },
        { key: "enable", name: () => enable ? "禁用规则" : "启用规则", callback: enableRule },
        { key: "del", name: "删除规则", callback: deleteRule },

    ]}><div key={index} className="ruleLine">
            <div className="fixedRuleBlock" title="是否启用该规则"> 启用
                <input type="checkbox" checked={enable} onChange={enableRule} />
            </div>
            {renderReg()}
            <div className="fixedRuleBlock" title="满足该条匹配规则的日志将被筛除还是保留"> 反向筛选
                <input type="checkbox" checked={exclude} onChange={(e) => {
                    ruleManager.filterRules[index].exclude = e.target.checked;
                    ruleManager.refreshRules();
                }} />
            </div>
            <div className="fixedRuleBlock">
                <button className="ruleButton" onClick={ruleUp} title="将该条规则上移一行"
                    disabled={index <= 0}>上移</button>
                <button className="ruleButton" onClick={ruleDown} title="将该条规则下移一行"
                    disabled={index >= ruleManager.filterRules.length - 1}>下移</button>
                <button className="ruleButton" onClick={deleteRule} title="删除该条规则">删除</button>
            </div>
        </div></ContextItem >
}