import { Button, Collapse, Flex, List } from "antd";
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
        const addRule = () => props.setColorRules([...props.colorRules, { reg: "" }]);
        return <List
            dataSource={props.colorRules}
            renderItem={(_, index) => <RuleLine_Color key={index} index={index} rules={props.colorRules} setRules={props.setColorRules} />}
            footer={<Button size='small' type="text" onClick={addRule}>添加规则</Button>}
        />
    }

    const renderReplaceRuleList = () => {
        const addRule = () => props.setReplaceRules([...props.replaceRules, { reg: "", replace: "" }]);
        return <List
            dataSource={props.replaceRules}
            renderItem={(_, index) => <RuleLine_Replace key={index} index={index} rules={props.replaceRules} setRules={props.setReplaceRules} />}
            footer={<Button size='small' type="text" onClick={addRule}>添加规则</Button>}
        />
    }

    const renderFilterRuleList = () => {
        const addRule = () => props.setFilterRules([...props.filterRules, { reg: "", exclude: false }]);
        return <List
            dataSource={props.filterRules}
            renderItem={(_, index) => <RuleLine_Filter key={index} index={index} rules={props.filterRules} setRules={props.setFilterRules} />}
            footer={<Button size='small' type="text" onClick={addRule}>添加规则</Button>}
        />
    }

    return <Flex style={{ overflowY: "scroll" }} >
        <Collapse style={{ width: '100%' }} size="small" items={[
            { key: '1', label: "颜色规则", children: renderColorRuleList() },
            { key: '2', label: "替换规则", children: renderReplaceRuleList() },
            { key: '3', label: "过滤规则", children: renderFilterRuleList() },
        ]} />
    </Flex>
}