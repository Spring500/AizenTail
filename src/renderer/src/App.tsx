import { logManager } from './managers/log_manager'
import { LogContainer } from './components/log_container'
import { TitleBar } from './components/title_bar'
import { MenuBar } from './components/menu_bar'
import { RulePanel } from './components/rule_panel/rule_panel'
import React, { useEffect, useState } from 'react'
import { TSetting, ruleManager } from './managers/rule_manager'
import { GetRef, Form } from 'antd'

type TRules = {
    name: string
    replaceRules: ReplaceConfig[]
    colorRules: ColorConfig[]
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
}

type FormInstance<T> = GetRef<typeof Form<T>>
export const RuleContext = React.createContext<FormInstance<TRules> | null>(null)
export const SettingContext = React.createContext<TSettings | null>(null)

export const App: React.FC = function () {
    const [fileUrl, setFileUrl] = useState('file directory')
    const [hint, setHint] = useState('')
    const [rulePanelVisible, setRulePanelVisible] = useState(false)
    const [colorRules, setColorRules] = useState<ColorConfig[]>([])
    const [replaceRules, setReplaceRules] = useState<ReplaceConfig[]>([])
    const [ruleInited, setRuleInited] = useState(false)
    const [isFiltering, setIsFiltering] = useState(false)
    const [isAutoScroll, setIsAutoScroll] = useState(true)
    const [isAlwaysOnTop, setIsAlwaysOnTop] = useState(false)
    const [isShowHoverText, setIsShowHoverText] = useState(false)

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
    useEffect(() => {
        logManager.onSetHint = setHint
        document.onkeyup = onKeyUp
        return () => {
            if (logManager.onSetHint == setHint) logManager.onSetHint = null
            if (document.onkeyup == onKeyUp) document.onkeyup = null
        }
    }, [isFiltering, isAutoScroll, isAlwaysOnTop])

    useEffect(() => {
        logManager.setFilterDisabled(!isFiltering)
    }, [isFiltering])

    useEffect(() => {
        window.electron.setAlwaysOnTop(isAlwaysOnTop)
    }, [isAlwaysOnTop])

    useEffect(() => {
        const onRuleChanged = (setting: TSetting): void => {
            setColorRules([...setting.color])
            setReplaceRules([...setting.replacing])
        }
        ruleManager.listen('ruleChanged', onRuleChanged)

        return (): void => {
            ruleManager.unlisten('ruleChanged', onRuleChanged)
        }
    }, [])

    useEffect(() => {
        if (!ruleInited) return
        ruleManager.saveConfig({ color: colorRules, replacing: replaceRules })
        console.log('save config', {
            color: colorRules,
            replacing: replaceRules
        })
    }, [colorRules, replaceRules])

    useEffect(() => {
        logManager.setFilterRules(colorRules)
    }, [colorRules])

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
            <TitleBar />
            <SettingContext.Provider
                value={{
                    isAlwaysOnTop,
                    setIsAlwaysOnTop,
                    isShowHoverText,
                    setIsShowHoverText,
                    isFiltering,
                    setIsFiltering,
                    isAutoScroll,
                    setIsAutoScroll
                }}
            >
                <RuleContext.Provider value={null}>
                    <MenuBar
                        switchRulePanelVisible={onSwitchRulePanelVisible}
                        rulePanelVisible={rulePanelVisible}
                        loadRule={(filepath) => ruleManager.reloadConfig(filepath)}
                        saveRule={(filepath) =>
                            ruleManager.saveFile(filepath, {
                                color: colorRules,
                                replacing: replaceRules
                            })
                        }
                        openLogFile={(filepath) => {
                            logManager.openFile(filepath)
                            setFileUrl(filepath)
                        }}
                    />
                    <LogContainer
                        manager={logManager}
                        style={logContainerStyle}
                        onChangeFile={OnChangeFile}
                        replaceRules={replaceRules}
                        colorRules={colorRules}
                    />
                    {rulePanelVisible && (
                        <RulePanel
                            replaceRules={replaceRules}
                            colorRules={colorRules}
                            callbacks={{
                                setReplaceRules,
                                setColorRules
                            }}
                        />
                    )}
                    <div id="hintBar" className="systemInfo">
                        <div>路径: {fileUrl}</div>
                        {hint}
                    </div>
                </RuleContext.Provider>
            </SettingContext.Provider>
        </>
    )
}
