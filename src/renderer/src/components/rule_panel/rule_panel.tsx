import { createRef, useEffect, useState } from "react";
import { ruleManager } from "../../managers/rule_manager";
import { RuleLine_Color, RuleLine_Replace, RuleLine_Filter } from "../rule_panel/rule_line";

export const RulePanel = function () {
    const ruleContainerRef = createRef<HTMLDivElement>();
    const [colorRules, setColorRules] = useState(ruleManager.colorRules);
    const [replaceRules, setReplaceRules] = useState(ruleManager.replaceRules);
    const [filterRules, setFilterRules] = useState(ruleManager.filterRules);

    const loadSetting = () => {
        const colorRules: ColorConfig[] = [];
        for (const rule of ruleManager.colorRules) {
            colorRules.push({ ...rule });
        }
        setColorRules(colorRules);
        const replaceRules: ReplaceConfig[] = [];
        for (const rule of ruleManager.replaceRules) {
            replaceRules.push({ ...rule });
        }
        setReplaceRules(replaceRules);
        const filterRules: FilterConfig[] = [];
        for (const rule of ruleManager.filterRules) {
            filterRules.push({ ...rule });
        }
        setFilterRules(filterRules);
    }

    useEffect(() => {
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
                    enable={rule.enable ?? false} reg={rule.reg ?? ""}
                    regexEnable={rule.regexEnable ?? false}
                    background={rule.background} color={rule.color}
                    onRegChange={onRegChange}
                    onBackColorChange={onBackColorChange}
                    onFontColorChange={onFontColorChange} />
            }
            )}
            <div className="ruleLine"><button className="ruleButton" onClick={onAddRule}>添加规则</button></div>
        </>
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
                <RuleLine_Replace key={rule.index} index={rule.index}
                    replace={rule.replace}
                    enable={rule.enable ?? false} reg={rule.reg}
                    regexEnable={rule.regexEnable ?? false}
                    onRegChange={onRegChange}
                    onReplaceChange={onReplaceChange} />
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
                <RuleLine_Filter key={rule.index} index={rule.index}
                    enable={rule.enable ?? false} reg={rule.reg}
                    exclude={rule.exclude ?? false}
                    regexEnable={rule.regexEnable ?? false}
                    onRegChange={onRegChange} />
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