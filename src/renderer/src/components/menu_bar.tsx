import { logManager } from '../managers/log_manager';
import { Button, Dropdown, Flex, MenuProps } from 'antd';
import { createRef } from 'react';

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

    const onInputFilter = () => inputFilterRef.current && logManager.setInputFilter(inputFilterRef.current.value);
    const onClickToggleAutoScroll = () => props.setIsAutoScroll(!props.isAutoScroll);
    const onClickToggleAlwaysOnTop = () => props.setIsAlwaysOnTop(!props.isAlwaysOnTop);

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

    const fileMenu: MenuProps['items'] = [
        { key: 'file', label: (<div onClick={openLogFile}>打开日志文件</div>), },
        { key: 'clear', label: (<div onClick={() => { logManager.clear() }}>清空日志</div>) },
        { key: 'loadRule', label: (<div onClick={openRuleFile}>加载规则文件...</div>) },
        { key: 'saveRuleAs', label: (<div onClick={saveRuleFile}>规则文件另存为...</div>) },
        { key: 'exit', label: (<div onClick={() => window.close()}>退出</div>) }
    ]

    const viewMenu: MenuProps['items'] = [
        { key: 'autoScroll', label: `自动滚动: ${props.isAutoScroll ? "开" : "关"}`, onClick: onClickToggleAutoScroll },
        { key: 'alwaysOnTop', label: `窗口置顶: ${props.isAlwaysOnTop ? "开" : "关"}`, onClick: onClickToggleAlwaysOnTop },
        { key: 'showHoverText', label: `悬浮提示: ${props.isShowHoverText ? "开" : "关"}`, onClick: () => props.setIsShowHoverText(!props.isShowHoverText) },
    ]

    return <Flex align='center' flex='1 1 auto'>
        <Dropdown menu={{ items: fileMenu }} trigger={['click']}>
            <Button className='menuButton'>文件(F)</Button>
        </Dropdown>
        <Dropdown menu={{ items: viewMenu }} trigger={['click']}>
            <button className='menuButton'>视图(V)</button>
        </Dropdown>
        <button className={props.rulePanelVisible ? 'menuButton activatedButton' : 'menuButton'}
            onClick={props.switchRulePanelVisible}
            title='开关筛选及高亮规则配置面板'>规则面板
        </button>
        <button className={props.isFiltering ? 'menuButton activatedButton' : 'menuButton'}
            onClick={() => { props.setIsFiltering(!props.isFiltering) }}
            title='暂时开关日志筛选功能 (ctrl+H)'>{props.isFiltering ? '日志筛选: 开' : '日志筛选: 关'}
        </button>
        <input type="text" className='menuFilter' placeholder='搜索日志' ref={inputFilterRef} onChange={onInputFilter} />
    </Flex>
}