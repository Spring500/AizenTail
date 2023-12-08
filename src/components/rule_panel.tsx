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

class ColorRuleLine extends React.Component<{ rule: ColorRule }> {
    protected onSetFontColor = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.props.rule.fontColor = e.target.value;
        this.forceUpdate();
    }

    protected onSetBackgroundColor = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.props.rule.backgroundColor = e.target.value;
        this.forceUpdate();
    }

    public render() {
        return <div className='ruleLine' style={{ display: 'flex' }}>
            <div style={{ color: this.props.rule.fontColor, background: this.props.rule.backgroundColor }}>染色规则</div>
            字体颜色<input type="color" onChange={this.onSetFontColor} />
            背景颜色<input type="color" />
            匹配规则<input className='ruleInput' type="text" placeholder='输入正则字符串' style={{ flex: "1 1 auto" }} />
            <button className='titleBarButton'>x</button>
        </div>
    }
}

export class ColorRulePanel extends React.Component<{ rules: ColorRule[] }> {
    public render() {
        return <div className='rulePanel'>
            {this.props.rules.map((rule, index) => <ColorRuleLine key={index} rule={rule} />)}
            <button >+添加规则</button>
        </div>
    }
}
