import React from "react";
import { ruleManager } from "../../../managers/rule_manager";
import { TextField } from "../../common/text_field";
import { ContextItem } from "../../common/contextItem";

const EXCLUDED_OPACITY = 0.3;

export const RuleLine_Color = function ({ index, enable, reg, regHasError, background, color, onFontColorChange, onBackColorChange, onRegChange }: {
    index: number, enable: boolean, reg: string, regHasError: boolean,
    background: string | undefined, color: string | undefined,
    onFontColorChange: (index: number, color: string) => void,
    onBackColorChange: (index: number, color: string) => void,
    /**匹配串发生输入变更时的回调函数 */ onRegChange: (index: number, reg: string) => void,
}) {

    const renderReg = () => {
        const rule = ruleManager.colorRules[index];
        return <div className="ruleBlock" title="根据输入的正则表达式匹配日志条目"
            style={{ opacity: enable ? undefined : EXCLUDED_OPACITY }}>
            <p style={{ color: regHasError ? "red" : undefined }}>匹配串</p>
            <TextField className="ruleInput" value={reg} placeholder="输入匹配串"
                style={{
                    color: rule?.color, backgroundColor: rule?.background,
                    border: regHasError ? "1px solid red" : "1px solid #ffffff00",
                }}
                onChange={(text) => onRegChange(index, text)}
                onEnter={(text) => ruleManager.setReg("color", index, text)} />
        </div>
    }

    const renderBackColor = () => {
        return <div className="ruleBlock" title="满足匹配条件的日志将应用选取的背景色，可以填写xml格式颜色字符串"
            style={{ opacity: enable ? undefined : EXCLUDED_OPACITY }}> 背景色
            <TextField className="ruleInput" list="colorList"
                onChange={(text) => onBackColorChange(index, text)}
                onEnter={(text) => ruleManager.setRuleBackgroundColor(index, text)}
                placeholder="选择背景颜色" value={background} />
        </div>
    }

    const renderFontColor = () => {
        return <div className="ruleBlock" title="满足匹配条件的日志将应用选取的字体色，可以填写xml格式颜色字符串"
            style={{ opacity: enable ? undefined : EXCLUDED_OPACITY }}> 字体色
            <TextField className="ruleInput" list="colorList"
                onChange={(text) => onFontColorChange(index, text)}
                onEnter={(text) => ruleManager.setRuleFontColor(index, text)}
                placeholder="选择字体颜色" value={color} />
        </div>
    }

    const ruleUp = () => ruleManager.switchRules("color", index, index - 1);
    const ruleDown = () => ruleManager.switchRules("color", index, index + 1);
    const enableRule = () => ruleManager.setEnable("color", index, !enable);
    const deleteRule = () => ruleManager.removeRule("color", index);

    return <ContextItem key={index} className="ruleLine" menuItems={[
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
    </ContextItem>
}