import React from 'react'
import { TSetting } from './managers/rule_manager'

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
