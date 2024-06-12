import { logManager } from './managers/log_manager'
import { LogContainer } from './components/log_container'
import { TitleBar } from './components/title_bar'
import { MenuBar } from './components/menu_bar'
import { RulePanel } from './components/rule_panel/rule_panel'
import React from 'react'
import { TRules, TSettings, ruleManager } from './managers/rule_manager'
import {
    Button,
    ConfigProvider,
    Flex,
    MappingAlgorithm,
    Space,
    Typography,
    message,
    theme
} from 'antd'
import { SettingFilled, OrderedListOutlined } from '@ant-design/icons'
import { SettingPanel } from './components/setting_panel'
import { MessageContext, RuleContext, SettingContext } from './context'

const AppMainComponent: React.FC = function () {
    const { messageApi } = React.useContext(MessageContext) ?? {}
    const { token } = theme.useToken()
    const ruleContext = React.useContext(RuleContext)
    const settingContext = React.useContext(SettingContext)
    const [hint, setHint] = React.useState('')
    const [fileUrl, setFileUrl] = React.useState('file directory')
    const [currentPanel, setCurrentPanel] = React.useState<'rule' | 'setting' | undefined>('rule')

    React.useEffect(() => {
        if (hint && hint.length > 0) messageApi?.info(hint)
    }, [hint])
    React.useEffect(() => {
        logManager.setFilterDisabled(!settingContext?.isFiltering)
    }, [settingContext?.isFiltering])

    React.useEffect(() => {
        window.electron.setAlwaysOnTop(!!settingContext?.isAlwaysOnTop)
    }, [settingContext?.isAlwaysOnTop])
    React.useEffect(() => {
        const onKeyUp = (e: KeyboardEvent): void => {
            switch (e.key) {
                case 'r':
                    e.altKey && settingContext?.setIsAutoScroll(!settingContext?.isAutoScroll)
                    return
                case 'h':
                    e.ctrlKey && settingContext?.setIsFiltering(!settingContext?.isFiltering)
                    return
                case 't':
                    e.altKey && settingContext?.setIsAlwaysOnTop(!settingContext?.isAlwaysOnTop)
                    return
                case 'F12':
                    window.electron.openDevTools()
                    return
            }
        }
        logManager.onSetHint = setHint
        document.onkeyup = onKeyUp
        return () => {
            if (logManager.onSetHint == setHint) logManager.onSetHint = null
            if (document.onkeyup == onKeyUp) document.onkeyup = null
        }
    }, [settingContext?.isFiltering, settingContext?.isAutoScroll, settingContext?.isAlwaysOnTop])
    const switchCurrentPanel = (panel: 'rule' | 'setting'): void =>
        setCurrentPanel(currentPanel === panel ? undefined : panel)
    const OnChangeFile = async (file: File | null): Promise<void> => {
        if (!file) return
        const filepath = file.path
        await logManager.openFile(filepath)
    }
    const logContainerStyle: React.CSSProperties =
        currentPanel !== undefined
            ? { resize: 'vertical', maxHeight: 'calc(100% - 120px)', height: '50%' }
            : { resize: 'none', height: 'auto', flex: '1 1 auto' }
    const style = {
        width: '100%',
        height: '100%',
        backgroundColor: token.colorBgContainer,
        '--theme-color-scrollbar-track': token.colorFillSecondary,
        '--theme-color-scrollbar-thumb': token.colorTextQuaternary,
        '--theme-color-scrollbar-thumb-hover': token.colorTextTertiary,
        '--theme-color-log-highlight-text': token.colorText,
        '--theme-color-log-highlight-background': token.colorFill,
        '--theme-color-log-search-hit-text': token.colorText,
        '--theme-color-log-search-hit-background': token.colorWarning,
        '--theme-border-radius': Math.floor(token.borderRadius / 2) + 'px',
        '--theme-color-bg-elevated': token.colorBgElevated
    }
    return (
        <Flex style={style} vertical>
            <TitleBar />
            <MenuBar
                switchRulePanelVisible={() => switchCurrentPanel('rule')}
                rulePanelVisible={currentPanel === 'rule'}
                loadRule={(filepath) => ruleManager.reloadConfig(filepath)}
                saveRule={(filepath) => ruleManager.saveFile(filepath, ruleContext?.rules)}
                openLogFile={(filepath) => {
                    logManager.openFile(filepath)
                    setFileUrl(filepath)
                }}
            />
            <LogContainer
                manager={logManager}
                style={logContainerStyle}
                onChangeFile={OnChangeFile}
            />
            {currentPanel && (
                <div className="ruleContainer" style={{ padding: '4px', margin: '4px' }}>
                    {currentPanel === 'rule' && <RulePanel />}
                    {currentPanel === 'setting' && <SettingPanel />}
                </div>
            )}
            <Flex justify="space-between" align="center" style={{ margin: '2px 4px' }}>
                <Space>
                    <Space.Compact>
                        <Button
                            type={currentPanel === 'rule' ? 'primary' : 'text'}
                            icon={<OrderedListOutlined />}
                            onClick={() => switchCurrentPanel('rule')}
                        />
                        <Button
                            type={currentPanel === 'setting' ? 'primary' : 'text'}
                            icon={<SettingFilled />}
                            onClick={() => switchCurrentPanel('setting')}
                        />
                    </Space.Compact>
                    <Typography.Text type="secondary">路径: {fileUrl}</Typography.Text>
                </Space>
                <Typography.Text type="secondary">{hint}</Typography.Text>
            </Flex>
        </Flex>
    )
}

export const AppMain: React.FC<{
    initSetting: TSettings
}> = function ({ initSetting }) {
    const [messageApi, contextHolder] = message.useMessage()
    const [rules, setRulesInternal] = React.useState(initSetting.rules ?? {})
    const [isFiltering, setIsFiltering] = React.useState(initSetting.isFiltering ?? true)
    const [isAutoScroll, setIsAutoScroll] = React.useState(initSetting.isAutoScroll ?? true)
    const [isAlwaysOnTop, setIsAlwaysOnTop] = React.useState(initSetting.isAlwaysOnTop ?? false)
    const [isShowHoverText, setIsShowHoverText] = React.useState(
        initSetting.isShowHoverText ?? true
    )
    const [colorTheme, setColorTheme] = React.useState(initSetting.colorTheme ?? 'dark')
    const [isCompactMode, setIsCompactMode] = React.useState(initSetting.isCompactMode ?? false)
    const [currentRuleSet, setCurrentRuleSetInternal] = React.useState(() => {
        const ruleSet = initSetting.currentRuleSet
        return !ruleSet || !initSetting.rules?.[ruleSet] ? 'default' : ruleSet
    })
    const setRules = (newRules: TRules): void => {
        logManager.setFilterRules(newRules?.[currentRuleSet]?.filterRules)
        setRulesInternal(newRules)
    }
    const setCurrentRuleSet = (ruleSet: string): void => {
        logManager.setFilterRules(rules?.[currentRuleSet]?.filterRules)
        setCurrentRuleSetInternal(ruleSet)
    }

    const [currentHoverFilter, setCurrentHoverFilter] = React.useState<number | undefined>(
        undefined
    )
    const settingContextValue: React.ContextType<typeof SettingContext> = {
        isAlwaysOnTop,
        setIsAlwaysOnTop,
        isShowHoverText,
        setIsShowHoverText,
        isFiltering,
        setIsFiltering,
        isAutoScroll,
        setIsAutoScroll,
        currentRuleSet,
        setCurrentRuleSet,
        colorTheme,
        setColorTheme,
        isCompactMode,
        setIsCompactMode,
        currentHoverFilter,
        setCurrentHoverFilter
    }

    const ruleContext: React.ContextType<typeof RuleContext> = {
        rules,
        addFilter: (setKey, rule) => {
            if (!rule) return
            const newRules: TRules = { ...rules }
            const ruleSet = newRules[setKey] ?? (newRules[setKey] = {})
            const filters = ruleSet.filterRules ?? (ruleSet.filterRules = [])
            filters.push(rule)
            setRules(newRules)
        },
        setFilter: (setKey, index, rule) => {
            if (!rule) return
            const newRules = { ...rules }
            const ruleSet = newRules[setKey] ?? (newRules[setKey] = {})
            const filters = ruleSet.filterRules ?? (ruleSet.filterRules = [])
            if (index < 0 || index >= filters.length) return
            filters[index] = rule
            setRules(newRules)
        },
        delFilter: (setKey, index) => {
            const newRules = { ...rules }
            const ruleSet = newRules[setKey]
            if (!ruleSet) return
            const filters = ruleSet.filterRules ?? (ruleSet.filterRules = [])

            ruleSet.filterRules = filters.filter((_, i) => i !== index)
            setRules(newRules)
        },
        insertFilter: (setKey, index1, index2) => {
            const newRules = { ...rules }
            const ruleSet = newRules[setKey]
            if (!ruleSet) return
            const filters = ruleSet.filterRules ?? (ruleSet.filterRules = [])
            if (index1 < 0 || index1 >= filters.length || index2 < 0 || index2 >= filters.length)
                return
            // 把index1的元素插入到index2之前
            filters.splice(index2, 0, filters.splice(index1, 1)[0])
            setRules(newRules)
        },
        addReplace: (setKey, rule) => {
            if (!rule) return
            const newRules = { ...rules }
            const ruleSet = newRules[setKey] ?? (newRules[setKey] = {})
            const replaces = ruleSet.replaceRules ?? (ruleSet.replaceRules = [])
            replaces.push(rule)
            setRules(newRules)
        },

        delReplace: (setKey, index) => {
            const newRules = { ...rules }
            const ruleSet = newRules[setKey]
            if (!ruleSet) return

            let replaces = ruleSet.replaceRules
            if (!replaces) ruleSet.replaceRules = replaces = []

            ruleSet.replaceRules = replaces.filter((_, i) => i !== index)
            setRules(newRules)
        },
        insertReplace: (setKey, index1, index2) => {
            const newRules = { ...rules }
            const ruleSet = newRules[setKey]
            if (!ruleSet) return

            let replaces = ruleSet.replaceRules
            if (!replaces) ruleSet.replaceRules = replaces = []

            if (index1 < 0 || index1 >= replaces.length || index2 < 0 || index2 >= replaces.length)
                return
            // 把index1的元素插入到index2之前
            replaces.splice(index2, 0, replaces.splice(index1, 1)[0])
            setRules(newRules)
        },
        setReplace: (setKey, index, rule) => {
            if (!rule) return
            const newRules = { ...rules }
            const ruleSet = newRules[setKey] ?? (newRules[setKey] = {})
            const replaces = ruleSet.replaceRules ?? (ruleSet.replaceRules = [])
            if (index < 0 || index >= replaces.length) return
            replaces[index] = rule
            setRules(newRules)
        },
        resetRules: setRules,
        newRuleSet: (ruleSetName) => {
            if (rules[ruleSetName]) {
                messageApi.error(`规则集 ${ruleSetName} 已存在`)
                return
            }
            const newRules = { ...rules }
            newRules[ruleSetName] = { filterRules: [], replaceRules: [] }
            setRules(newRules)
        },
        copyRuleSet: (oldName, newName) => {
            if (!oldName || !newName || !rules || !rules[oldName] || oldName === newName) return
            if (rules[newName]) {
                messageApi.error(`规则集 ${newName} 已存在`)
                return
            }
            const newRules = { ...rules }
            newRules[newName] = JSON.parse(JSON.stringify(newRules[oldName]))
            setRules(newRules)
        },
        deleteRuleSet: (ruleSetName) => {
            if (!ruleSetName) return
            const newRules = { ...rules }
            delete newRules[ruleSetName]
            setRules(newRules)
            setCurrentRuleSet('default')
        },
        renameRuleSet: (oldName, newName) => {
            if (!oldName || !newName || !rules || !rules[oldName] || oldName === newName) return
            if (rules[newName]) {
                messageApi.error(`规则集 ${newName} 已存在`)
                return
            }
            const newRules = { ...rules }
            newRules[newName] = newRules[oldName]
            delete newRules[oldName]
            setRules(newRules)
            setCurrentRuleSet(newName)
        }
    }
    React.useEffect(() => {
        logManager.setFilterRules(rules?.[currentRuleSet]?.filterRules)
    }, [rules, currentRuleSet])
    React.useEffect(() => {
        const newSetting = {
            rules,
            isAlwaysOnTop,
            isShowHoverText,
            isFiltering,
            isAutoScroll,
            currentRuleSet,
            colorTheme,
            isCompactMode
        }
        ruleManager.saveConfig(newSetting)
        console.log('save config', newSetting)
    }, [
        rules,
        isAlwaysOnTop,
        isShowHoverText,
        isFiltering,
        isAutoScroll,
        currentRuleSet,
        colorTheme,
        isCompactMode
    ])
    const algorithm: MappingAlgorithm[] = []
    if (colorTheme === 'dark') algorithm.push(theme.darkAlgorithm)
    if (isCompactMode) algorithm.push(theme.compactAlgorithm)
    return (
        <ConfigProvider
            theme={{
                token: { motion: false, fontSize: 13 },
                components: { Table: { cellPaddingBlockSM: 0 } },
                algorithm
            }}
            componentSize="small"
        >
            <SettingContext.Provider value={settingContextValue}>
                <RuleContext.Provider value={ruleContext}>
                    <MessageContext.Provider value={{ messageApi, contextHolder }}>
                        {contextHolder}
                        <AppMainComponent />
                    </MessageContext.Provider>
                </RuleContext.Provider>
            </SettingContext.Provider>
        </ConfigProvider>
    )
}
