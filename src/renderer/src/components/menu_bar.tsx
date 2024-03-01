import { logManager } from '../managers/log_manager';
import { Dropdown } from './common/dropdown';
import { createRef, useState } from 'react';

export const MenuBar = function (props: {
    switchRulePanelVisible: () => void, rulePanelVisible: boolean,
    isFiltering: boolean, setIsFiltering: (v: boolean) => void,
    isAutoScroll: boolean, setIsAutoScroll: (v: boolean) => void,
    isAlwaysOnTop: boolean, setIsAlwaysOnTop: (v: boolean) => void,
    isShowHoverText: boolean, setIsShowHoverText: (v: boolean) => void,
    openLogFile: (filepath: string) => void,
    loadRule: (filepath: string) => void,
    saveRule: (filepath: string) => void,
}) {
    const inputFilterRef = createRef<HTMLInputElement>();
    const [openedMenu, setOpenedMenu] = useState<undefined | "file" | "view">();

    const onInputFilter = () => inputFilterRef.current && logManager.setInputFilter(inputFilterRef.current.value);
    const onClickToggleAutoScroll = () => props.setIsAutoScroll(!props.isAutoScroll);
    const onClickToggleAlwaysOnTop = () => props.setIsAlwaysOnTop(!props.isAlwaysOnTop);

    const switchMenu = (menu: "file" | "view") => {
        setOpenedMenu(openedMenu === menu ? undefined : menu);
    }

    const closeMenu = () => setOpenedMenu(undefined);

    const openLogFile = async () => {
        const filepath: string = await window.electron.openFileDialog("打开日志文件",
            undefined,
            [
                { name: "All Files", extensions: ["*"] },
                { name: "Log Files", extensions: ["log"] },
                { name: "Text Files", extensions: ["txt"] },
            ],
        );
        props.openLogFile(filepath);
    }

    const openRuleFile = async () => {
        const filepath: string = await window.electron.openFileDialog("加载规则文件",
            undefined,
            [
                { name: "All Files", extensions: ["*"] },
                { name: "JSON Files", extensions: ["json"] },
            ],
        );
        props.loadRule(filepath);
    }

    const saveRuleFile = async () => {
        const filepath: string = await window.electron.openSaveDialog("规则文件另存为",
            'AizenTailSetting.json',
            [
                { name: "All Files", extensions: ["*"] },
                { name: "JSON Files", extensions: ["json"] },
            ],
        );
        props.saveRule(filepath);
    }

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
                        { key: 'autoScroll', name: () => `自动滚动: ${props.isAutoScroll ? "开" : "关"}`, callback: onClickToggleAutoScroll },
                        { key: 'alwaysOnTop', name: () => `窗口置顶: ${props.isAlwaysOnTop ? "开" : "关"}`, callback: onClickToggleAlwaysOnTop },
                        { key: 'showHoverText', name: () => `悬浮提示: ${props.isShowHoverText ? "开" : "关"}`, callback: () => props.setIsShowHoverText(!props.isShowHoverText) },
                    ]}
                    style={{ position: "absolute", top: "100%", display: "block" }}
                />
            </div>
            <button className='menuButton' aria-expanded={openedMenu === "view"} onClick={() => switchMenu("view")}>视图(V)</button>
            <button className={props.rulePanelVisible ? 'menuButton activatedButton' : 'menuButton'}
                onClick={props.switchRulePanelVisible}
                title='开关筛选及高亮规则配置面板'>规则面板
            </button>
            <button className={props.isFiltering ? 'menuButton activatedButton' : 'menuButton'}
                onClick={() => { props.setIsFiltering(!props.isFiltering) }}
                title='暂时开关日志筛选功能 (ctrl+H)'>{props.isFiltering ? '日志筛选: 开' : '日志筛选: 关'}
            </button>
            <input type="text" className='menuFilter' placeholder='搜索日志' ref={inputFilterRef} onChange={onInputFilter} />
        </div></>
}