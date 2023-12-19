import * as React from 'react';
export class Dropdown extends React.Component<{
    visible: boolean, items: { key: string, name: string | (() => string), callback: (...args: any[]) => any }[],
    style?: React.CSSProperties
}> {
    public render() {
        return <div style={{ position: "relative", width: "auto", height: "100%" }}>
            <ul className='menuDropdown'
                style={{ ...this.props.style, display: this.props.visible ? 'block' : 'none', position: "absolute", listStyleType: "none" }}>
                {this.props.items.map(item => <li key={item.key}><button className='menuDropdownButton' onClick={item.callback}>{
                    typeof item.name === 'string' ? item.name : item.name()
                }</button></li>)}
            </ul>
        </div>
    }
}