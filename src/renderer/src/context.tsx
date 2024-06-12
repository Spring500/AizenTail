import React from 'react'
import { TRules } from './managers/rule_manager'
import { MessageInstance } from 'antd/es/message/interface'

type TRuleContext = {
    rules: TRules | undefined
    addFilter(ruleSetName: string, rule: FilterConfig): void
    setFilter(ruleSetName: string, index: number, rule: FilterConfig): void
    delFilter(ruleSetName: string, index: number): void
    insertFilter(ruleSetName: string, index1: number, index2: number): void
    addReplace(ruleSetName: string, rule: ReplaceConfig): void
    setReplace(ruleSetName: string, index: number, rule: ReplaceConfig): void
    delReplace(ruleSetName: string, index: number): void
    insertReplace(ruleSetName: string, index1: number, index2: number): void
    resetRules(rules: TRules): void
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
}

export const RuleContext = React.createContext<TRuleContext | null>(null)
export const SettingContext = React.createContext<TSettingContext | null>(null)
export const MessageContext = React.createContext<{
    messageApi: MessageInstance
    contextHolder: React.ReactNode
} | null>(null)

export const LogContext = React.createContext<{
    filtedLogIds: number[]
    lineToIndexMap: Map<number, number>
} | null>(null)
