import React from "react";
import { ruleManager } from "../../managers/rule_manager";
import { checkRegExp } from "../../utils";
import { RuleLine_Color, RuleLine_Replace, RuleLine_Filter } from "./rule_line";

export const RulePanel = function () {
    const ruleContainerRef = React.createRef<HTMLDivElement>();
    const [colorRules, setColorRules] = React.useState(ruleManager.colorRules);
    const [replaceRules, setReplaceRules] = React.useState(ruleManager.replaceRules);
    const [filterRules, setFilterRules] = React.useState(ruleManager.filterRules);

    const loadSetting = () => {
        const colorRules = [];
        for (const rule of ruleManager.colorRules) {
            colorRules.push({ reg: rule.reg, background: rule.background, color: rule.color, enable: rule.enable, index: rule.index });
        }
        setColorRules(colorRules);
        const replaceRules = [];
        for (const rule of ruleManager.replaceRules) {
            replaceRules.push({ reg: rule.reg, replace: rule.replace, enable: rule.enable, index: rule.index });
        }
        setReplaceRules(replaceRules);
        const filterRules = [];
        for (const rule of ruleManager.filterRules) {
            filterRules.push(rule);
        }
        setFilterRules(filterRules);
    }

    React.useEffect(() => {
        ruleManager.onRuleChanged = () => { loadSetting(); }
        loadSetting();
        const div = ruleContainerRef.current;
        if (!div) return;
    }, []);

    const renderColorRuleList = () => {
        const onRegChange = (index: number, reg: string) => {
            setColorRules(colorRules.map(rule => rule.index === index ? { ...rule, reg } : rule));
        }
        const onBackColorChange = (index: number, color: string) => {
            setColorRules(colorRules.map(rule => rule.index === index ? { ...rule, background: color } : rule));
        }
        const onFontColorChange = (index: number, color: string) => {
            setColorRules(colorRules.map(rule => rule.index === index ? { ...rule, color } : rule));
        }
        const onAddRule = () => { ruleManager.addRule("color"); }
        return <><div className="ruleTitleText">颜色规则</div>
            {colorRules.map(rule => {
                const index = rule.index;
                return <RuleLine_Color key={index} index={index}
                    onRegChange={onRegChange}
                    onBackColorChange={onBackColorChange}
                    onFontColorChange={onFontColorChange}
                    enable={rule.enable ?? false} reg={rule.reg ?? ""} regHasError={!checkRegExp(rule.reg)}
                    background={rule.background} color={rule.color}
                />
            }
            )}
            <div className="ruleLine"><button className="ruleButton" onClick={onAddRule}>添加规则</button></div>
            <datalist id="colorList">
                <option value="white" />
                <option value="red" />
                <option value="yellow" />
                <option value="gray" />
                <option value="pink" />
                <option value="green" />
                <option value="blue" />
                <option value="purple" />
                <option value="orange" />
                <option value="brown" />
                <option value="#ffaaff" />
            </datalist></>
    }

    const renderReplaceRuleList = () => {
        const onRegChange = (index: number, reg: string) => {
            setReplaceRules(replaceRules.map(rule => rule.index === index ? { ...rule, reg } : { ...rule }));
        }
        const onReplaceChange = (index: number, replace: string) => {
            setReplaceRules(replaceRules.map(rule => rule.index === index ? { ...rule, replace } : rule));
        }
        const onAddRule = () => { ruleManager.addRule("replace"); }
        return <><div className="ruleTitleText">替换规则</div>
            {replaceRules.map(rule =>
                <RuleLine_Replace key={rule.index} index={rule.index} onRegChange={onRegChange} onReplaceChange={onReplaceChange}
                    enable={rule.enable ?? false} reg={rule.reg} regHasError={!checkRegExp(rule.reg)} replace={rule.replace}
                />
            )}
            <div className="ruleLine"><button className="ruleButton" onClick={onAddRule}>添加规则</button></div>
        </>;
    }

    const renderFilterRuleList = () => {
        const onRegChange = (index: number, reg: string) => {
            setFilterRules(filterRules.map(rule => rule.index === index ? { ...rule, reg } : rule));
        }
        const onAddRule = () => { ruleManager.addRule("filter"); }
        return <><div className="ruleTitleText">过滤规则</div>
            {filterRules.map(rule =>
                <RuleLine_Filter key={rule.index} index={rule.index} onRegChange={onRegChange} exclude={rule.exclude ?? false}
                    enable={rule.enable ?? false} reg={rule.reg} regHasError={!checkRegExp(rule.reg)}
                />
            )}
            <div className="ruleLine"><button className="ruleButton" onClick={onAddRule}>添加规则</button></div>
        </>;
    }

    return <div className="ruleContainer" ref={ruleContainerRef} >
        {renderColorRuleList()}
        {renderReplaceRuleList()}
        {renderFilterRuleList()}
    </div>
}