import React from 'react';
import { logManager } from '../managers/log_manager';
import { Dropdown } from './common/dropdown';
import { ruleManager } from '../managers/rule_manager';


const openLogFile = async () => {
    const filepath: string = await (window as any).electron.openFileDialog("打开日志文件",
        undefined,
        [
            { name: "All Files", extensions: ["*"] },
            { name: "Log Files", extensions: ["log"] },
            { name: "Text Files", extensions: ["txt"] },
        ],
    );
    await logManager.openFile(filepath);
}

const openRuleFile = async () => {
    const filepath: string = await (window as any).electron.openFileDialog("加载规则文件",
        undefined,
        [
            { name: "All Files", extensions: ["*"] },
            { name: "JSON Files", extensions: ["json"] },
        ],
    );
    await ruleManager.openFile(filepath);
}

const saveRuleFile = async () => {
    const filepath: string = await (window as any).electron.openSaveDialog("规则文件另存为",
        'AizenTailSetting.json',
        [
            { name: "All Files", extensions: ["*"] },
            { name: "JSON Files", extensions: ["json"] },
        ],
    );
    await ruleManager.saveFile(filepath);
}

export class MenuBar extends React.Component<
    { switchRulePanelVisible: () => void },
    { autoScroll: boolean, alwaysOnTop: boolean, openedMenu: undefined | "file" | "view" }> {
    constructor(props: { switchRulePanelVisible: () => void }) {
        super(props);
        this.state = { autoScroll: true, alwaysOnTop: false, openedMenu: undefined };
        logManager.onSetAutoScroll = (autoScroll) => this.setState({ autoScroll });
        logManager.onSetAlwaysOnTop = (alwaysOnTop) => this.setState({ alwaysOnTop });
    }
    private onInputFilter = (event: React.ChangeEvent<HTMLInputElement>) => logManager.setInputFilter(event.target.value);
    private onClickToggleAutoScroll = () => logManager.toggleAutoScroll();
    private onClickToggleAlwaysOnTop = () => logManager.setAlwaysOnTop(!this.state.alwaysOnTop);

    protected switchMenu(menu: "file" | "view") {
        this.setState({ openedMenu: this.state.openedMenu === menu ? undefined : menu });
    }

    override componentDidMount() {
        logManager.registerHotKey('f', true, false, false, () => this.switchMenu('file'));
        logManager.registerHotKey('v', true, false, false, () => this.switchMenu('view'));
    }

    override componentWillUnmount() {
        logManager.unregisterHotKey('f', true, false, false);
        logManager.unregisterHotKey('v', true, false, false);
    }

    public render() {
        const closeMenu = () => this.setState({ openedMenu: undefined });
        return <>
            <div className='menuBar' style={{ listStyleType: "none" }}>
                <Dropdown visible={this.state.openedMenu === "file"}
                    onClickOutside={closeMenu}
                    items={
                        [{ key: 'file', name: '打开日志...', callback: () => { openLogFile(), closeMenu() } },
                        { key: 'clear', name: '清空日志', callback: () => { logManager.clear(), closeMenu() } },
                        { key: 'loadRule', name: '加载规则文件...', callback: () => { openRuleFile(), closeMenu() } },
                        { key: 'saveRuleAs', name: '规则文件另存为...', callback: () => { saveRuleFile(), closeMenu() } },
                        { key: 'exit', name: '退出', callback: () => window.close() }]

                    } style={{ left: 0 }} />
                <button className='menuButton' aria-expanded={this.state.openedMenu === "file"} onClick={() => this.switchMenu("file")}>文件(F)</button>
                <Dropdown visible={this.state.openedMenu === "view"}
                    onClickOutside={closeMenu}
                    items={[
                        { key: 'autoScroll', name: () => `自动滚动: ${this.state.autoScroll ? "开" : "关"}`, callback: this.onClickToggleAutoScroll },
                        { key: 'alwaysOnTop', name: () => `窗口置顶: ${this.state.alwaysOnTop ? "开" : "关"}`, callback: this.onClickToggleAlwaysOnTop },
                    ]} />
                <button className='menuButton' aria-expanded={this.state.openedMenu === "view"} onClick={() => this.switchMenu("view")}>视图(V)</button>
                <button className='menuButton'
                    onClick={this.props.switchRulePanelVisible}
                    title='开关筛选及高亮规则配置面板'>规则面板
                </button>
                <button className='menuButton'
                    onClick={() => { logManager.setFilterDisabled(!logManager.isDisableFilter()) }}
                    title='暂时开关日志筛选功能 (ctrl+H)'>{logManager.isDisableFilter() ? '日志筛选: 关' : '日志筛选: 开'}
                </button>
                <input type="text" className='menuFilter' placeholder='搜索日志' onChange={this.onInputFilter} />
            </div></>
    }
}
