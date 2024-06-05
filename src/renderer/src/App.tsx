import { logManager } from './managers/log_manager'
import { LogContainer } from './components/log_container'
import { TitleBar } from './components/title_bar'
import { MenuBar } from './components/menu_bar'
import { RulePanel } from './components/rule_panel/rule_panel'
import React from 'react'
import { TSetting, ruleManager } from './managers/rule_manager'
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
import { SettingFilled } from '@ant-design/icons'

type TRuleContext = {
    rules: TSetting | undefined
    addFilter(ruleSetName: string, rule: FilterConfig): void
    setFilter(ruleSetName: string, index: number, rule: FilterConfig): void
    delFilter(ruleSetName: string, index: number): void
    insertFilter(ruleSetName: string, index1: number, index2: number): void
    addReplace(ruleSetName: string, rule: ReplaceConfig): void
    setReplace(ruleSetName: string, index: number, rule: ReplaceConfig): void
    delReplace(ruleSetName: string, index: number): void
    insertReplace(ruleSetName: string, index1: number, index2: number): void
    resetRules(rules: TSetting): void
    newRuleSet(ruleSetName: string): void
    copyRuleSet(oldName: string | undefined, newName: string | undefined): void
    deleteRuleSet(ruleSetName: string | undefined): void
    renameRuleSet(oldName: string | undefined, newName: string | undefined): void
}

type TSettings = {
    isAlwaysOnTop: boolean
    setIsAlwaysOnTop: (value: boolean) => void
    isShowHoverText: boolean
    setIsShowHoverText: (value: boolean) => void
    isFiltering: boolean
    setIsFiltering: (v: boolean) => void
    isAutoScroll: boolean
    setIsAutoScroll: (v: boolean) => void
    currentRuleSet: string
    setCurrentRuleSet: (v: string) => void
    colorTheme: 'light' | 'dark'
    setColorTheme: (v: 'light' | 'dark') => void
    isCompactMode: boolean
    setIsCompactMode: (v: boolean) => void
}

export const RuleContext = React.createContext<TRuleContext | null>(null)
export const SettingContext = React.createContext<TSettings | null>(null)

const App: React.FC = function () {
    const [messageApi] = message.useMessage()
    const { token } = theme.useToken()
    const ruleContext = React.useContext(RuleContext)
    const settingContext = React.useContext(SettingContext)
    const [hint, setHint] = React.useState('')
    const [fileUrl, setFileUrl] = React.useState('file directory')
    const [rulePanelVisible, setRulePanelVisible] = React.useState(false)

    React.useEffect(() => {
        if (hint && hint.length > 0) messageApi.info(hint)
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
    const onSwitchRulePanelVisible = (): void => setRulePanelVisible(!rulePanelVisible)
    const OnChangeFile = async (file: File | null): Promise<void> => {
        if (!file) return
        const filepath = file.path
        await logManager.openFile(filepath)
    }
    const logContainerStyle: React.CSSProperties = rulePanelVisible
        ? { resize: 'vertical', maxHeight: 'calc(100% - 120px)', height: '50%' }
        : { resize: 'none', height: 'auto', flex: '1 1 auto' }
    const style = {
        width: '100%',
        height: '100%',
        backgroundColor: token.colorBgLayout,
        '--theme-color-scrollbar-track': token.colorFillSecondary,
        '--theme-color-scrollbar-thumb': token.colorTextQuaternary,
        '--theme-color-scrollbar-thumb-hover': token.colorTextTertiary,
        '--theme-border-radius': Math.floor(token.borderRadius / 2)
    }
    return (
        <Flex style={style} vertical>
            <TitleBar />
            <MenuBar
                switchRulePanelVisible={onSwitchRulePanelVisible}
                rulePanelVisible={rulePanelVisible}
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
            {rulePanelVisible && <RulePanel />}
            <Flex justify="space-between" align="center" style={{ margin: '2px 4px' }}>
                <Space>
                    <Button
                        type={rulePanelVisible ? 'primary' : 'text'}
                        icon={<SettingFilled />}
                        onClick={onSwitchRulePanelVisible}
                    />
                    <Typography.Text type="secondary">路径: {fileUrl}</Typography.Text>
                </Space>
                <Typography.Text type="secondary">提示{hint}</Typography.Text>
            </Flex>
        </Flex>
    )
}

export const AppWarpper: React.FC = function () {
    const [messageApi, contextHolder] = message.useMessage()

    const [rules, setRules] = React.useState<TSetting>(() => {
        ruleManager.reloadConfig()
        return {}
    })
    const [isFiltering, setIsFiltering] = React.useState(true)
    const [isAutoScroll, setIsAutoScroll] = React.useState(true)
    const [isAlwaysOnTop, setIsAlwaysOnTop] = React.useState(false)
    const [isShowHoverText, setIsShowHoverText] = React.useState(true)
    const [colorTheme, setColorTheme] = React.useState<'light' | 'dark'>('dark')
    const [isCompactMode, setIsCompactMode] = React.useState(false)
    const [currentRuleSet, setCurrentRuleSet] = React.useState('default')

    const settingContextValue: TSettings = {
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
        setIsCompactMode
    }

    const setRulesFromApp = (newRules: TSetting): void => {
        setRules(newRules)
        ruleManager.saveConfig(newRules)
        console.log('save config', newRules)
    }
    const ruleContext: TRuleContext = {
        rules,
        addFilter: (setKey, rule) => {
            if (!rule) return
            const newRules: TSetting = { ...rules }

            let ruleSet = newRules[setKey]
            if (!ruleSet) newRules[setKey] = ruleSet = { filterRules: [], replaceRules: [] }

            let filters = ruleSet.filterRules
            if (!filters) ruleSet.filterRules = filters = []

            filters.push(rule)
            setRulesFromApp(newRules)
        },
        setFilter: (setKey, index, rule) => {
            if (!rule) return
            const newRules = { ...rules }

            let ruleSet = newRules[setKey]
            if (!ruleSet) newRules[setKey] = ruleSet = { filterRules: [], replaceRules: [] }

            let filters = ruleSet.filterRules
            if (!filters) ruleSet.filterRules = filters = []
            if (index < 0 || index >= filters.length) return
            filters[index] = rule
            setRulesFromApp(newRules)
        },
        delFilter: (setKey, index) => {
            const newRules = { ...rules }
            const ruleSet = newRules[setKey]
            if (!ruleSet) return

            let filters = ruleSet.filterRules
            if (!filters) ruleSet.filterRules = filters = []

            ruleSet.filterRules = filters.filter((_, i) => i !== index)
            setRulesFromApp(newRules)
        },
        insertFilter: (setKey, index1, index2) => {
            const newRules = { ...rules }
            const ruleSet = newRules[setKey]
            if (!ruleSet) return

            let filters = ruleSet.filterRules
            if (!filters) ruleSet.filterRules = filters = []

            if (index1 < 0 || index1 >= filters.length || index2 < 0 || index2 >= filters.length)
                return
            // 把index1的元素插入到index2之前
            filters.splice(index2, 0, filters.splice(index1, 1)[0])
            setRulesFromApp(newRules)
        },
        addReplace: (setKey, rule) => {
            if (!rule) return
            const newRules = { ...rules }

            let ruleSet = newRules[setKey]
            if (!ruleSet) newRules[setKey] = ruleSet = { filterRules: [], replaceRules: [] }

            let replaces = ruleSet.replaceRules
            if (!replaces) ruleSet.replaceRules = replaces = []

            replaces.push(rule)
            setRulesFromApp(newRules)
        },
        copyRuleSet: (oldName, newName) => {
            if (!oldName || !newName || !rules || !rules[oldName]) return
            if (oldName === newName) return
            if (rules[newName]) {
                messageApi.error(`规则集 ${newName} 已存在`)
                return
            }
            const newRules = { ...rules }
            newRules[newName] = JSON.parse(JSON.stringify(newRules[oldName]))
            setRulesFromApp(newRules)
        },
        delReplace: (setKey, index) => {
            const newRules = { ...rules }
            const ruleSet = newRules[setKey]
            if (!ruleSet) return

            let replaces = ruleSet.replaceRules
            if (!replaces) ruleSet.replaceRules = replaces = []

            ruleSet.replaceRules = replaces.filter((_, i) => i !== index)
            setRulesFromApp(newRules)
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
            setRulesFromApp(newRules)
        },
        setReplace: (setKey, index, rule) => {
            if (!rule) return
            const newRules = { ...rules }

            let ruleSet = newRules[setKey]
            if (!ruleSet) newRules[setKey] = ruleSet = { filterRules: [], replaceRules: [] }

            let replaces = ruleSet.replaceRules
            if (!replaces) ruleSet.replaceRules = replaces = []
            if (index < 0 || index >= replaces.length) return
            replaces[index] = rule
            setRulesFromApp(newRules)
        },
        resetRules: (newRules) => {
            setRulesFromApp(newRules)
        },
        newRuleSet: (ruleSetName) => {
            if (rules && rules[ruleSetName]) {
                messageApi.error(`规则集 ${ruleSetName} 已存在`)
                return
            }
            const newRules = { ...rules }
            newRules[ruleSetName] = { filterRules: [], replaceRules: [] }
            setRulesFromApp(newRules)
        },
        deleteRuleSet: (ruleSetName) => {
            if (!ruleSetName) return
            const newRules = { ...rules }
            delete newRules[ruleSetName]
            setRulesFromApp(newRules)
            setCurrentRuleSet('default')
        },
        renameRuleSet: (oldName, newName) => {
            if (!oldName || !newName || !rules || !rules[oldName]) return
            if (oldName === newName) return
            if (rules[newName]) {
                messageApi.error(`规则集 ${newName} 已存在`)
                return
            }
            const newRules = { ...rules }
            newRules[newName] = newRules[oldName]
            delete newRules[oldName]
            setRulesFromApp(newRules)
            setCurrentRuleSet(newName)
        }
    }
    React.useEffect(() => {
        logManager.setFilterRules(rules?.[currentRuleSet]?.filterRules)
    }, [rules, currentRuleSet])

    React.useEffect(() => {
        const onRuleChanged = (newRules: TSetting): void => {
            setRules(newRules)
        }
        ruleManager.listen('ruleChanged', onRuleChanged)
        return (): void => ruleManager.unlisten('ruleChanged', onRuleChanged)
    }, [])

    const algorithm: MappingAlgorithm[] = []
    if (colorTheme === 'dark') algorithm.push(theme.darkAlgorithm)
    if (isCompactMode) algorithm.push(theme.compactAlgorithm)
    return (
        <>
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
                        {contextHolder}
                        <App />
                    </RuleContext.Provider>
                </SettingContext.Provider>
            </ConfigProvider>
        </>
    )
}
