import React from 'react';
import { logManager } from '../managers/log_manager';
import { Dropdown } from './common/dropdown';



export class MenuBar extends React.Component<
    { switchRulePanelVisible: () => void },
    { autoScroll: boolean, alwaysOnTop: boolean, openedMenu: undefined | "file" | "view" }> {
    constructor(props: { switchRulePanelVisible: () => void }) {
        super(props);
        this.state = { autoScroll: true, alwaysOnTop: false, openedMenu: undefined };
        logManager.onSetAutoScroll = (autoScroll) => this.setState({ autoScroll });
        logManager.onSetAlwaysOnTop = (alwaysOnTop) => this.setState({ alwaysOnTop });
    }

    private onClickOpenFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        file && await logManager.openFile(file)
    }
    private onInputFilter = (event: React.ChangeEvent<HTMLInputElement>) => logManager.setInputFilter(event.target.value);
    private onClickToggleAutoScroll = () => logManager.toggleAutoScroll();
    private onClickToggleAlwaysOnTop = () => logManager.setAlwaysOnTop(!this.state.alwaysOnTop);

    public render() {
        const closeMenu = () => this.setState({ openedMenu: undefined });
        const switchMenu = (menu: "file" | "view") => this.setState({ openedMenu: this.state.openedMenu === menu ? undefined : menu });
        return <><input type="file" id="openLogButton" onChange={this.onClickOpenFile} style={{ display: "none" }} />
            <div className='menuBar'>
                <Dropdown
                    visible={this.state.openedMenu === "file"}
                    items={
                        [{ key: 'file', name: '打开日志...', callback: () => { document.getElementById('openLogButton')?.click(), closeMenu() } },
                        { key: 'clear', name: '清空日志', callback: () => { logManager.clear(), closeMenu() } },
                        { key: 'loadRule', name: '加载规则文件...', callback: () => { closeMenu() } },
                        { key: 'saveRuleAs', name: '规则文件另存为...', callback: () => { closeMenu() } },
                        { key: 'rulePanel', name: '规则面板', callback: () => { this.props.switchRulePanelVisible(), closeMenu() } },
                        { key: 'exit', name: '退出', callback: () => window.close() }]

                    } style={{ left: 0 }} />
                <button className='menuButton' aria-expanded={this.state.openedMenu === "file"} onClick={() => switchMenu("file")}>文件(F)</button>
                <Dropdown
                    visible={this.state.openedMenu === "view"}
                    items={[
                        { key: 'autoScroll', name: () => `自动滚动: ${this.state.autoScroll ? "开" : "关"}`, callback: this.onClickToggleAutoScroll },
                        { key: 'alwaysOnTop', name: () => `窗口置顶: ${this.state.alwaysOnTop ? "开" : "关"}`, callback: this.onClickToggleAlwaysOnTop },
                    ]} />
                <button className='menuButton' aria-expanded={this.state.openedMenu === "view"} onClick={() => switchMenu("view")}>视图(V)</button>
                <input type="text" className='menuFilter' placeholder='搜索日志' onChange={this.onInputFilter} />
            </div></>
    }
}
