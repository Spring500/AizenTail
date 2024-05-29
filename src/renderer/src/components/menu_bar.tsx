import { logManager } from '../managers/log_manager'
// import { Dropdown } from './common/dropdown';
import { Dropdown, Input, MenuProps } from 'antd'
import React, { createRef } from 'react'
import {
    FolderOpenFilled,
    LayoutFilled,
    SearchOutlined,
    FilterFilled,
    SettingFilled
} from '@ant-design/icons'

export const MenuBar: React.FC<{
    switchRulePanelVisible: () => void
    rulePanelVisible: boolean
    isFiltering: boolean
    setIsFiltering: (v: boolean) => void
    isAutoScroll: boolean
    setIsAutoScroll: (v: boolean) => void
    isAlwaysOnTop: boolean
    setIsAlwaysOnTop: (v: boolean) => void
    isShowHoverText: boolean
    setIsShowHoverText: (v: boolean) => void
    openLogFile: (filepath: string) => void
    loadRule: (filepath: string) => void
    saveRule: (filepath: string) => void
}> = function (props) {
    const fileMenuItems: MenuProps['items'] = [
        { key: 'file', label: '打开日志...', onClick: () => openLogFile() },
        { key: 'clear', label: '清空日志', onClick: () => logManager.clear() },
        { key: 'loadRule', label: '加载规则文件...', onClick: () => openRuleFile() },
        { key: 'saveRuleAs', label: '规则文件另存为...', onClick: () => saveRuleFile() },
        { key: 'exit', label: '退出', onClick: () => window.close() }
    ]

    const viewMenuItems: MenuProps['items'] = [
        {
            key: 'autoScroll',
            label: `自动滚动: ${props.isAutoScroll ? '开' : '关'}`,
            onClick: () => props.setIsAutoScroll(!props.isAutoScroll)
        },
        {
            key: 'alwaysOnTop',
            label: `窗口置顶: ${props.isAlwaysOnTop ? '开' : '关'}`,
            onClick: () => props.setIsAlwaysOnTop(!props.isAlwaysOnTop)
        },
        {
            key: 'showHoverText',
            label: `悬浮提示: ${props.isShowHoverText ? '开' : '关'}`,
            onClick: () => props.setIsShowHoverText(!props.isShowHoverText)
        }
    ]

    const inputFilterRef = createRef<HTMLInputElement>()

    const onInputFilter = (): void => {
        if (inputFilterRef.current) logManager.setInputFilter(inputFilterRef.current.value)
    }

    const openLogFile = async (): Promise<void> => {
        const filepath: string = await window.electron.openFileDialog('打开日志文件', undefined, [
            { name: 'All Files', extensions: ['*'] },
            { name: 'Log Files', extensions: ['log'] },
            { name: 'Text Files', extensions: ['txt'] }
        ])
        props.openLogFile(filepath)
    }

    const openRuleFile = async (): Promise<void> => {
        const filepath: string = await window.electron.openFileDialog('加载规则文件', undefined, [
            { name: 'All Files', extensions: ['*'] },
            { name: 'JSON Files', extensions: ['json'] }
        ])
        props.loadRule(filepath)
    }

    const saveRuleFile = async (): Promise<void> => {
        const filepath: string = await window.electron.openSaveDialog(
            '规则文件另存为',
            'AizenTailSetting.json',
            [
                { name: 'All Files', extensions: ['*'] },
                { name: 'JSON Files', extensions: ['json'] }
            ]
        )
        props.saveRule(filepath)
    }

    return (
        <>
            <div className="menuBar" style={{ listStyleType: 'none' }}>
                {/* <div style={{ position: "relative", height: "100%" }}>
            </div> */}
                <Dropdown menu={{ items: fileMenuItems }} trigger={['click']}>
                    <button className="menuButton">
                        <FolderOpenFilled /> 文件(F)
                    </button>
                </Dropdown>
                <Dropdown menu={{ items: viewMenuItems }} trigger={['click']}>
                    <button className="menuButton">
                        <LayoutFilled /> 视图(V)
                    </button>
                </Dropdown>
                <button
                    className={props.rulePanelVisible ? 'menuButton activatedButton' : 'menuButton'}
                    onClick={props.switchRulePanelVisible}
                    title="开关筛选及高亮规则配置面板"
                >
                    <SettingFilled />
                    规则面板
                </button>
                <button
                    className={props.isFiltering ? 'menuButton activatedButton' : 'menuButton'}
                    onClick={() => props.setIsFiltering(!props.isFiltering)}
                    title="暂时开关日志筛选功能 (ctrl+H)"
                >
                    <FilterFilled /> {props.isFiltering ? '日志筛选: 开' : '日志筛选: 关'}
                </button>
                <Input
                    type="text"
                    placeholder="搜索日志"
                    onChange={onInputFilter}
                    prefix={<SearchOutlined />}
                ></Input>
            </div>
        </>
    )
}
