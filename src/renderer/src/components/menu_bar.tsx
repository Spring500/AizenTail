import { logManager } from '../managers/log_manager'
// import { Dropdown } from './common/dropdown';
import { Button, Dropdown, Input, MenuProps } from 'antd'
import React from 'react'
import {
    FolderOpenFilled,
    LayoutFilled,
    SearchOutlined,
    FilterFilled,
    OrderedListOutlined
} from '@ant-design/icons'
import { SettingContext } from '@renderer/context'

export const MenuBar: React.FC<{
    switchRulePanelVisible: () => void
    rulePanelVisible: boolean
    openLogFile: (filepath: string) => void
    loadRule: (filepath: string) => void
    saveRule: (filepath: string) => void
}> = function (props) {
    const {
        isAutoScroll,
        isAlwaysOnTop,
        isShowHoverText,
        isFiltering,
        setIsAutoScroll,
        setIsAlwaysOnTop,
        setIsShowHoverText,
        setIsFiltering,
        setInputFilter
    } = React.useContext(SettingContext)

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
            label: `自动滚动: ${isAutoScroll ? '开' : '关'}`,
            onClick: () => setIsAutoScroll(!isAutoScroll)
        },
        {
            key: 'alwaysOnTop',
            label: `窗口置顶: ${isAlwaysOnTop ? '开' : '关'}`,
            onClick: () => setIsAlwaysOnTop(!isAlwaysOnTop)
        },
        {
            key: 'showHoverText',
            label: `悬浮提示: ${isShowHoverText ? '开' : '关'}`,
            onClick: () => setIsShowHoverText(!isShowHoverText)
        }
    ]

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
                    <Button type="text" icon={<FolderOpenFilled />}>
                        文件(F)
                    </Button>
                </Dropdown>
                <Dropdown menu={{ items: viewMenuItems }} trigger={['click']}>
                    <Button type="text" icon={<LayoutFilled />}>
                        视图(V)
                    </Button>
                </Dropdown>
                <Button
                    type={props.rulePanelVisible ? 'primary' : 'text'}
                    onClick={props.switchRulePanelVisible}
                    title="开关筛选及高亮规则配置面板"
                    icon={<OrderedListOutlined />}
                >
                    规则面板
                </Button>
                <Button
                    type={isFiltering ? 'primary' : 'text'}
                    onClick={() => setIsFiltering(!isFiltering)}
                    title="暂时开关日志筛选功能 (ctrl+H)"
                    icon={<FilterFilled />}
                >
                    {isFiltering ? '日志筛选: 开' : '日志筛选: 关'}
                </Button>
                <Input
                    type="text"
                    placeholder="搜索日志"
                    spellCheck={false}
                    onChange={(e) => setInputFilter(e.target.value)}
                    prefix={<SearchOutlined />}
                ></Input>
            </div>
        </>
    )
}
