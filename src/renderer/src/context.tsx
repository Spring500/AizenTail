import React from 'react'
import { TRules as TRuleSets } from './managers/rule_manager'
import { MessageInstance } from 'antd/es/message/interface'

type TRuleContext = {
    ruleSets: TRuleSets | undefined
    addFilter(ruleSetName: string, rule: FilterConfig): void
    setFilter(ruleSetName: string, index: number, rule: FilterConfig): void
    delFilter(ruleSetName: string, index: number): void
    insertFilter(ruleSetName: string, index1: number, index2: number): void
    addReplace(ruleSetName: string, rule: ReplaceConfig): void
    setReplace(ruleSetName: string, index: number, rule: ReplaceConfig): void
    delReplace(ruleSetName: string, index: number): void
    insertReplace(ruleSetName: string, index1: number, index2: number): void
    resetRules(rules: TRuleSets): void
    newRuleSet(ruleSetName: string): void
    copyRuleSet(oldName: string | undefined, newName: string | undefined): void
    deleteRuleSet(ruleSetName: string | undefined): void
    renameRuleSet(oldName: string | undefined, newName: string | undefined): void
}
type TSettingContext = {
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
    currentHoverFilter?: number
    setCurrentHoverFilter?: (v: number | undefined) => void
    setInputFilter: (v: string) => void
    /** 特殊处理，用于触发滚动到高亮日志。后续应该考虑改成在logManager抛事件的时候直接标明本次变化是新增日志还是改变规则 */
    scrollToHighlightSignal: number
}

const noImpl = (): void => {
    console.error('No implementation')
}

export const RuleContext = React.createContext<TRuleContext>({
    ruleSets: {},
    addFilter: noImpl,
    setFilter: noImpl,
    delFilter: noImpl,
    insertFilter: noImpl,
    addReplace: noImpl,
    setReplace: noImpl,
    delReplace: noImpl,
    insertReplace: noImpl,
    resetRules: noImpl,
    newRuleSet: noImpl,
    copyRuleSet: noImpl,
    deleteRuleSet: noImpl,
    renameRuleSet: noImpl
})
export const SettingContext = React.createContext<TSettingContext>({
    isAlwaysOnTop: false,
    setIsAlwaysOnTop: noImpl,
    isShowHoverText: true,
    setIsShowHoverText: noImpl,
    isFiltering: true,
    setIsFiltering: noImpl,
    isAutoScroll: true,
    setIsAutoScroll: noImpl,
    currentRuleSet: 'default',
    setCurrentRuleSet: noImpl,
    colorTheme: 'light',
    setColorTheme: noImpl,
    isCompactMode: false,
    setIsCompactMode: noImpl,
    setInputFilter: noImpl,
    scrollToHighlightSignal: 0
})
export const MessageContext = React.createContext<{
    messageApi: MessageInstance
    contextHolder: React.ReactNode
} | null>(null)

export const LogContext = React.createContext<{
    filtedLogIds: number[]
    lineToIndexMap: Map<number, number>
} | null>(null)
