import { RuleLine_Color, RuleLine_Replace, RuleLine_Filter } from "../rule_panel/rule_line";

export const RulePanel = function (props: {
    replaceRules: ReplaceConfig[],
    setReplaceRules: (replaceRules: ReplaceConfig[]) => void,
    colorRules: ColorConfig[],
    setColorRules: (colorRules: ColorConfig[]) => void,
    filterRules: FilterConfig[],
    setFilterRules: (filterRules: FilterConfig[]) => void,
}) {

    const renderColorRuleList = () => {
        const addRule = () => props.setColorRules([
            ...props.colorRules,
            { index: props.colorRules.length, reg: "" }
        ]);
        return <><div className="ruleTitleText">颜色规则</div>
            {props.colorRules.map(rule =>
                <RuleLine_Color key={rule.index} index={rule.index}
                    rules={props.colorRules} setRules={props.setColorRules} />
            )}
            <div className="ruleLine"><button className="ruleButton" onClick={addRule}>添加规则</button></div>
        </>
    }

    const renderReplaceRuleList = () => {
        const addRule = () => props.setReplaceRules([
            ...props.replaceRules,
            { index: props.replaceRules.length, reg: "", replace: "" }
        ]);
        return <><div className="ruleTitleText">替换规则</div>
            {props.replaceRules.map(rule =>
                <RuleLine_Replace key={rule.index} index={rule.index}
                    rules={props.replaceRules} setRules={props.setReplaceRules} />
            )}
            <div className="ruleLine"><button className="ruleButton" onClick={addRule}>添加规则</button></div>
        </>;
    }

    const renderFilterRuleList = () => {
        const addRule = () => props.setFilterRules([
            ...props.filterRules,
            { index: props.filterRules.length, reg: "", exclude: false }
        ]);
        return <><div className="ruleTitleText">过滤规则</div>
            {props.filterRules.map(rule =>
                <RuleLine_Filter key={rule.index} index={rule.index}
                    rules={props.filterRules} setRules={props.setFilterRules} />
            )}
            <div className="ruleLine"><button className="ruleButton" onClick={addRule}>添加规则</button></div>
        </>;
    }

    return <div className="ruleContainer" >
        {renderColorRuleList()}
        {renderReplaceRuleList()}
        {renderFilterRuleList()}
    </div>
}