import React from 'react';

type FilterRule = {
    type: 'include' | 'exclude',
    reg: string,
};
type ColorRule = {
    reg: string,
    fontColor?: string,
    backgroundColor?: string,
};

function Component_ColorRule({ rule }: { rule: ColorRule }) {
    const [fontColor, setFontColor] = React.useState(rule.fontColor);
    const [backgroundColor, setBackgroundColor] = React.useState(rule.backgroundColor);
    return <div className='ruleLine' style={{ display: 'flex' }}>
        <div style={{ color: rule.fontColor, background: rule.backgroundColor }}>染色规则</div>
        字体颜色<input type="color" onChange={(e) => setFontColor(e.target.value)} />
        背景颜色<input type="color" onChange={(e) => setBackgroundColor(e.target.value)} />
        匹配规则<input type="text" style={{ flex: "1 1 auto" }} />
        <button className='titleBarButton'>x</button>
    </div>
}

function Component_ColorRulePanel({ rules }: { rules: ColorRule[] }) {
    const [foldState, setFoldState] = React.useState(false);
    if (foldState)
        return <div className='rulePanel'>
            <button className='rulePanelButton' onClick={() => setFoldState(false)}>v染色规则</button>
        </div>
    else
        return <div className='rulePanel'>
            <button className='rulePanelButton' onClick={() => setFoldState(true)}>^染色规则</button>
            {rules.map((rule, index) => <Component_ColorRule key={index} rule={rule} />)}
            <button >+添加规则</button>
        </div>
}

export function Component_RulePanel() {
    return <Component_ColorRulePanel rules={[{ reg: '', fontColor: 'red' }, { reg: '', fontColor: 'yellow' }]} />
}