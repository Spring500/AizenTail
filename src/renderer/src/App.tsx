import { logManager } from './managers/log_manager'
import { LogContainer } from './components/log_container'
import { TitleBar } from './components/title_bar'
import { MenuBar } from './components/menu_bar'
import { RulePanel } from './components/rule_panel/rule_panel'
import React, { useEffect, useState } from 'react'
import { TSetting, ruleManager } from './managers/rule_manager'
import { message } from 'antd'

type TRuleContext = {
    rules: TSetting | undefined
    addFilter(ruleSetName: string, rule: FilterConfig): void
    setFilter(ruleSetName: string, index: number, rule: FilterConfig): void
    delFilter(ruleSetName: string, index: number): void
    addReplace(ruleSetName: string, rule: ReplaceConfig): void
    setReplace(ruleSetName: string, index: number, rule: ReplaceConfig): void
    delReplace(ruleSetName: string, index: number): void
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
}

export const RuleContext = React.createContext<TRuleContext | null>(null)
export const SettingContext = React.createContext<TSettings | null>(null)

export const App: React.FC = function () {
    const [messageApi, contextHolder] = message.useMessage()
    const [fileUrl, setFileUrl] = useState('file directory')
    const [hint, setHint] = useState('')
    const [rulePanelVisible, setRulePanelVisible] = useState(false)
    const [rules, setRules] = useState<TSetting>()
    const [ruleInited, setRuleInited] = useState(false)
    const [isFiltering, setIsFiltering] = useState(false)
    const [isAutoScroll, setIsAutoScroll] = useState(true)
    const [isAlwaysOnTop, setIsAlwaysOnTop] = useState(false)
    const [isShowHoverText, setIsShowHoverText] = useState(false)
    const [currentRuleSet, setCurrentRuleSet] = useState('default')

    const settingContextValue = {
        isAlwaysOnTop,
        setIsAlwaysOnTop,
        isShowHoverText,
        setIsShowHoverText,
        isFiltering,
        setIsFiltering,
        isAutoScroll,
        setIsAutoScroll,
        currentRuleSet,
        setCurrentRuleSet
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
            setRules(newRules)
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
            setRules(newRules)
        },
        delFilter: (setKey, index) => {
            const newRules = { ...rules }
            const ruleSet = newRules[setKey]
            if (!ruleSet) return

            let filters = ruleSet.filterRules
            if (!filters) ruleSet.filterRules = filters = []

            ruleSet.filterRules = filters.filter((_, i) => i !== index)
            setRules(newRules)
        },
        addReplace: (setKey, rule) => {
            if (!rule) return
            const newRules = { ...rules }

            let ruleSet = newRules[setKey]
            if (!ruleSet) newRules[setKey] = ruleSet = { filterRules: [], replaceRules: [] }

            let replaces = ruleSet.replaceRules
            if (!replaces) ruleSet.replaceRules = replaces = []

            replaces.push(rule)
            setRules(newRules)
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
        setReplace: (setKey, index, rule) => {
            if (!rule) return
            const newRules = { ...rules }

            let ruleSet = newRules[setKey]
            if (!ruleSet) newRules[setKey] = ruleSet = { filterRules: [], replaceRules: [] }

            let replaces = ruleSet.replaceRules
            if (!replaces) ruleSet.replaceRules = replaces = []
            if (index < 0 || index >= replaces.length) return
            replaces[index] = rule
            setRules(newRules)
        },
        resetRules: (newRules) => {
            setRules(newRules)
        },
        newRuleSet: (ruleSetName) => {
            if (rules && rules[ruleSetName]) {
                messageApi.error(`规则集 ${ruleSetName} 已存在`)
                return
            }
            const newRules = { ...rules }
            newRules[ruleSetName] = { filterRules: [], replaceRules: [] }
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
            if (!oldName || !newName || !rules || !rules[oldName]) return
            if (oldName === newName) return
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
        const onRuleChanged = (newRules: TSetting): void => {
            setRules(newRules)
        }
        ruleManager.listen('ruleChanged', onRuleChanged)

        return (): void => {
            ruleManager.unlisten('ruleChanged', onRuleChanged)
        }
    }, [])

    React.useEffect(() => {
        if (hint && hint.length > 0) messageApi.info(hint)
    }, [hint])

    useEffect(() => {
        const onKeyUp = (e: KeyboardEvent): void => {
            switch (e.key) {
                case 'r':
                    e.altKey && setIsAutoScroll(!isAutoScroll)
                    return
                case 'h':
                    e.ctrlKey && setIsFiltering(!isFiltering)
                    return
                case 't':
                    e.altKey && setIsAlwaysOnTop(!isAlwaysOnTop)
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
    }, [isFiltering, isAutoScroll, isAlwaysOnTop])

    useEffect(() => {
        if (!ruleInited) return
        ruleManager.saveConfig(rules)
        console.log('save config', rules)
    }, [rules])

    // 当ruleInited为false时加载规则
    useEffect(() => {
        if (!ruleInited) {
            ruleManager.reloadConfig()
            setRuleInited(true)
        }
    }, [ruleInited])

    const onSwitchRulePanelVisible = (): void => setRulePanelVisible(!rulePanelVisible)

    const OnChangeFile = async (file: File | null): Promise<void> => {
        if (!file) return
        const filepath = file.path
        await logManager.openFile(filepath)
    }
    const logContainerStyle: React.CSSProperties = rulePanelVisible
        ? { resize: 'vertical', maxHeight: 'calc(100% - 120px)', height: '50%' }
        : { resize: 'none', height: 'auto', flex: '1 1 auto' }
    return (
        <>
            {contextHolder}
            <TitleBar />
            <SettingContext.Provider value={settingContextValue}>
                <RuleContext.Provider value={ruleContext}>
                    <MenuBar
                        switchRulePanelVisible={onSwitchRulePanelVisible}
                        rulePanelVisible={rulePanelVisible}
                        loadRule={(filepath) => ruleManager.reloadConfig(filepath)}
                        saveRule={(filepath) => ruleManager.saveFile(filepath, rules)}
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
                    <div id="hintBar" className="systemInfo">
                        <div>路径: {fileUrl}</div>
                        {hint}
                    </div>
                </RuleContext.Provider>
            </SettingContext.Provider>
        </>
    )
}
