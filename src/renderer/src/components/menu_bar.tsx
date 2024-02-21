import { logManager } from '../managers/log_manager';
import { Dropdown } from './common/dropdown';
import { ruleManager } from '../managers/rule_manager';
import { createRef, useState } from 'react';


const openLogFile = async () => {
    const filepath: string = await window.electron.openFileDialog("打开日志文件",
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
    const filepath: string = await window.electron.openFileDialog("加载规则文件",
        undefined,
        [
            { name: "All Files", extensions: ["*"] },
            { name: "JSON Files", extensions: ["json"] },
        ],
    );
    await ruleManager.openFile(filepath);
}

const saveRuleFile = async () => {
    const filepath: string = await window.electron.openSaveDialog("规则文件另存为",
        'AizenTailSetting.json',
        [
            { name: "All Files", extensions: ["*"] },
            { name: "JSON Files", extensions: ["json"] },
        ],
    );
    await ruleManager.saveFile(filepath);
}

export const MenuBar = function ({ switchRulePanelVisible, rulePanelVisible }: {
    switchRulePanelVisible: () => void, rulePanelVisible: boolean
}) {
    const [autoScroll, setAutoScroll] = useState(true);
    const [alwaysOnTop, setAlwaysOnTop] = useState(false);
    const [openedMenu, setOpenedMenu] = useState<undefined | "file" | "view">();
    logManager.onSetAutoScroll = (autoScroll) => setAutoScroll(autoScroll);
    logManager.onSetAlwaysOnTop = (alwaysOnTop) => setAlwaysOnTop(alwaysOnTop);

    const inputFilterRef = createRef<HTMLInputElement>();
    const onInputFilter = () => inputFilterRef.current && logManager.setInputFilter(inputFilterRef.current.value);
    const onClickToggleAutoScroll = () => logManager.toggleAutoScroll();
    const onClickToggleAlwaysOnTop = () => logManager.setAlwaysOnTop(!alwaysOnTop);

    const switchMenu = (menu: "file" | "view") => {
        setOpenedMenu(openedMenu === menu ? undefined : menu);
    }

    const closeMenu = () => setOpenedMenu(undefined);

    return <>
        <div className='menuBar' style={{ listStyleType: "none" }}>
            <div style={{ position: "relative", height: "100%" }}>
                <Dropdown visible={openedMenu === "file"}
                    onClickOutside={closeMenu}
                    items={
                        [{ key: 'file', name: '打开日志...', callback: () => { openLogFile(), closeMenu() } },
                        { key: 'clear', name: '清空日志', callback: () => { logManager.clear(), closeMenu() } },
                        { key: 'loadRule', name: '加载规则文件...', callback: () => { openRuleFile(), closeMenu() } },
                        { key: 'saveRuleAs', name: '规则文件另存为...', callback: () => { saveRuleFile(), closeMenu() } },
                        { key: 'exit', name: '退出', callback: () => window.close() }]

                    } style={{ position: "absolute", top: "100%", display: "block" }} />
            </div>
            <button className='menuButton' aria-expanded={openedMenu === "file"} onClick={() => switchMenu("file")}>文件(F)</button>
            <div style={{ position: "relative", height: "100%" }}>
                <Dropdown visible={openedMenu === "view"}
                    onClickOutside={closeMenu}
                    items={[
                        { key: 'autoScroll', name: () => `自动滚动: ${autoScroll ? "开" : "关"}`, callback: onClickToggleAutoScroll },
                        { key: 'alwaysOnTop', name: () => `窗口置顶: ${alwaysOnTop ? "开" : "关"}`, callback: onClickToggleAlwaysOnTop },
                    ]}
                    style={{ position: "absolute", top: "100%", display: "block" }}
                />
            </div>
            <button className='menuButton' aria-expanded={openedMenu === "view"} onClick={() => switchMenu("view")}>视图(V)</button>
            <button className={rulePanelVisible ? 'menuButton activatedButton' : 'menuButton'}
                onClick={switchRulePanelVisible}
                title='开关筛选及高亮规则配置面板'>规则面板
            </button>
            <button className={!logManager.isDisableFilter() ? 'menuButton activatedButton' : 'menuButton'}
                onClick={() => { logManager.setFilterDisabled(!logManager.isDisableFilter()) }}
                title='暂时开关日志筛选功能 (ctrl+H)'>{logManager.isDisableFilter() ? '日志筛选: 关' : '日志筛选: 开'}
            </button>
            <input type="text" className='menuFilter' placeholder='搜索日志' ref={inputFilterRef} onChange={onInputFilter} />
        </div></>
}