import { ILogManager } from '../managers/log_manager'
import { IListView, ListView } from './common/list'
import React, { useEffect, useState } from 'react'
import { createRef } from 'react'
import { Dropdown, Typography, theme } from 'antd'
import { RuleContext, SettingContext } from '@renderer/context'
import { CaretRightOutlined } from '@ant-design/icons'

const EXCLUDED_OPACITY = 0.3

const rexCache = new Map<string, RegExp | undefined>()
const getRegExp = function (matchText: string): RegExp | undefined {
    // 如果正则表达式缓存过大则清理
    if (rexCache.size > 100) rexCache.clear()

    let res = rexCache.get(matchText)
    if (!res) {
        try {
            res = new RegExp(matchText, 'gi')
        } catch {
            /* empty */
        } finally {
            rexCache.set(matchText, res)
        }
    } else res.lastIndex = 0
    return res
}

const replaceLog = function (
    rawText: string,
    replaceRules: ReplaceConfig[] | undefined,
    ignoreRule: number
): string {
    let text = rawText ?? ''
    if (!replaceRules) return text
    for (let i = 0; i < replaceRules.length; i++) {
        const { reg: regText, enable, regexEnable, replace } = replaceRules[i]
        if (!enable) continue
        if (!regText || regText === '') continue
        if (i === ignoreRule) {
            if (regexEnable) {
                const regExp = getRegExp(regText)
                if (!regExp) continue
                let newText = '',
                    leftText = text
                while (leftText.length > 0) {
                    const match = regExp.exec(leftText)
                    if (!match) {
                        newText += leftText
                        break
                    }
                    const matchedText = match[0]
                    regExp.lastIndex = 0
                    const replaceText = matchedText.replace(
                        regExp,
                        `\x01\x02D${matchedText}\x01\x02N${replace ?? ''}\x01`
                    )
                    newText = newText + leftText.substring(0, match.index) + replaceText
                    leftText = leftText.substring(match.index + matchedText.length)
                    regExp.lastIndex = 0
                }
                text = newText
            } else {
                text = text.replaceAll(regText, `\x01\x02D${regText}\x01\x02N${replace ?? ''}\x01`)
            }
        } else {
            if (regexEnable) {
                const regExp = getRegExp(regText)
                if (!regExp) continue
                text = text.replaceAll(regExp, replace ?? '')
            } else {
                text = text.replaceAll(regText, replace ?? '')
            }
        }
    }
    return text
}

const splitLog = function (text: string, keywords: string[]): React.ReactNode {
    let splitedText = text
    for (const keyword of keywords) {
        const plainedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        splitedText = splitedText.replace(
            new RegExp(`(${plainedKeyword})`, 'gi'),
            '\x01\x02L$1\x01'
        )
    }
    return splitedText.split('\x01').map((text, index) => {
        if (text[0] !== '\x02') {
            if (text === '') return null
            return <span key={index}>{text}</span>
        }
        if (text.length < 2) return null
        switch (text[1]) {
            case 'D':
                return (
                    <span className="logDeleted" key={index}>
                        {text.substring(2)}
                    </span>
                )
            case 'N':
                return (
                    <span className="logAdded" key={index}>
                        {text.substring(2)}
                    </span>
                )
            case 'L':
            default:
                return (
                    <span className="logSearchHit" key={index}>
                        {text.substring(2)}
                    </span>
                )
        }
    })
}

const LogLine: React.FC<{
    rawLogText: string
    isHighlight: boolean
    manager: ILogManager
    getLogColor: (log: string) => React.CSSProperties
}> = function (props) {
    const { currentHoverFilter, currentRuleSet, isShowHoverText } = React.useContext(SettingContext)
    const { ruleSets } = React.useContext(RuleContext)
    const replaceRules = ruleSets?.[currentRuleSet ?? '']?.replaceRules
    const logText = replaceLog(props.rawLogText ?? '', replaceRules, currentHoverFilter ?? -1)

    return (
        <Typography.Text
            className={`logText${props.isHighlight ? ' highlightLogText' : ''}`}
            title={isShowHoverText ? logText : undefined}
            style={{ ...props.getLogColor(props.rawLogText), whiteSpace: 'pre' }}
        >
            {splitLog(logText, props.manager.inputFilters)}
            <br />
        </Typography.Text>
    )
}

export const LogContainer: React.FC<{
    style?: React.CSSProperties
    manager: ILogManager
    onChangeFile: (file: File | null) => void
}> = function (props) {
    const { token } = theme.useToken()
    const { currentRuleSet, isAutoScroll, isFiltering, scrollToHighlightSignal } =
        React.useContext(SettingContext)
    const { ruleSets } = React.useContext(RuleContext)
    const mainRef = createRef<HTMLDivElement>()
    const listRef = createRef<IListView>()
    const [dragging, setDragging] = useState(false)
    const [logCount, setLogCount] = useState(0)
    const [highlightLine, setHighlightLine] = useState(-1)
    const [filtedLogIds, setFiltedLogIds] = useState<number[]>([])
    const [lineToIndexMap, setLineToIndexMap] = useState<Map<number, number>>(new Map())

    const ruleSet = ruleSets?.[currentRuleSet ?? '']
    const replaceRules = ruleSet?.replaceRules ?? []
    const filterRules = ruleSet?.filterRules ?? []

    const onDrop = (event: DragEvent): void => {
        event.preventDefault()
        event.stopPropagation()
        setDragging(false)
        if (event.dataTransfer && event.dataTransfer.files.length > 0)
            props.onChangeFile(event.dataTransfer.files[0])
    }

    const onDragOver = (event: DragEvent): void => {
        event.preventDefault()
        event.stopPropagation()
    }

    const inRect = (x: number, y: number): boolean => {
        const rect = mainRef.current?.getBoundingClientRect()
        return !!rect && x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
    }

    const onDragEnter = (event: DragEvent): void => {
        event.preventDefault()
        event.stopPropagation()
        if (dragging) return
        // 检查当前鼠标位置是否在容器内
        if (inRect(event.clientX, event.clientY)) {
            setDragging(true)
        }
    }

    const onDragLeave = (event: DragEvent): void => {
        event.preventDefault()
        event.stopPropagation()
        if (!dragging) return
        // 检查当前鼠标位置是否在容器内
        if (!inRect(event.clientX, event.clientY)) {
            setDragging(false)
        }
    }

    const scrollToItem = function (index: number): void {
        listRef.current?.scrollToItem(index, 'center', 'instant')
    }

    // 监听manager的变化
    useEffect(() => {
        const manager = props.manager
        if (!manager) return
        manager.onFilterChanged = (count, filtedLogIds, lineToIndexMap): void => {
            setLogCount(count)
            setFiltedLogIds(filtedLogIds)
            setLineToIndexMap(lineToIndexMap)
        }
        const timer = setInterval(manager.refreshFile, 100)
        return () => {
            if (manager.onFilterChanged === setLogCount) manager.onFilterChanged = null
            clearInterval(timer)
        }
    }, [mainRef])

    // 监听文件拖放
    useEffect(() => {
        const current = mainRef.current
        if (!current) return
        current.addEventListener('drop', onDrop)
        current.addEventListener('dragover', onDragOver)
        current.addEventListener('dragleave', onDragLeave)
        current.addEventListener('dragenter', onDragEnter)

        return () => {
            current.removeEventListener('drop', onDrop)
            current.removeEventListener('dragover', onDragOver)
            current.removeEventListener('dragleave', onDragLeave)
            current.removeEventListener('dragenter', onDragEnter)
        }
    }, [mainRef])

    useEffect(() => {
        // 如果当前没有高亮行、且开启了自动滚动，则滚动到底部
        if (!isAutoScroll || highlightLine >= 0) return
        scrollToItem(isFiltering ? filtedLogIds.length - 1 : props.manager.logs.length - 1)
    }, [logCount, isFiltering])

    useEffect(() => {
        // 如果有高亮行，则在收到信号时滚动到高亮行
        if (highlightLine < 0) return
        const targetIndex = lineToIndex(highlightLine)
        if (targetIndex >= 0) scrollToItem(targetIndex)
    }, [scrollToHighlightSignal])

    const rexCache = new Map<string, RegExp | undefined>()
    const getRegExp = function (matchText: string): RegExp | undefined {
        let res = rexCache.get(matchText)
        if (!res) {
            try {
                res = new RegExp(matchText, 'gi')
            } catch {
                /* empty */
            } finally {
                rexCache.set(matchText, res)
            }
        } else res.lastIndex = 0
        return res
    }

    // 替换日志
    const replaceLog = function (rawText: string): string {
        let text = rawText ?? ''
        for (const rule of replaceRules) {
            if (!rule.enable) continue
            if (!rule.reg || rule.reg === '') continue
            if (rule.regexEnable) {
                const reg = getRegExp(rule.reg)
                if (reg) text = text.replace(reg, rule.replace ?? '')
            } else {
                if (text.includes(rule.reg)) text = text.replace(rule.reg, rule.replace ?? '')
            }
        }
        return text
    }

    // 获取日志颜色
    const getLogColor = function (log: string): React.CSSProperties {
        for (const rule of filterRules) {
            if (!rule.enable) continue
            let hitted = false
            if (rule.regexEnable) {
                hitted = getRegExp(rule.reg ?? '')?.test(log) ?? false
            } else {
                hitted = log.includes(rule.reg ?? '')
            }
            if (rule.exclude) continue
            if (!hitted) continue

            return {
                backgroundColor: rule.background,
                color: rule.color
            }
        }
        return {}
    }

    const hasFilterResult = (): boolean => {
        return filtedLogIds?.length > 0 && !!isFiltering
    }
    const indexToLine = (index: number): number => {
        return hasFilterResult() ? filtedLogIds[index] ?? -1 : index <= logCount - 1 ? index : -1
    }
    const lineToIndex = (line: number): number => {
        return hasFilterResult() ? lineToIndexMap.get(line) ?? -1 : line
    }
    const hasFilter = filterRules.length > 0 && filterRules.some((rule) => rule.enable)

    const LogRowRenderer = function (logIndex: number): React.ReactNode {
        const logLine = indexToLine(logIndex)
        if (logLine < 0) return null
        const manager = props.manager
        const rawLogText = manager.logs[indexToLine(logIndex)]?.text ?? ''
        const logText = replaceLog(rawLogText)
        const isExculed = !isFiltering && hasFilter && !lineToIndexMap.has(logIndex)
        const isHighlight = logLine >= 0 && logLine === highlightLine
        const opacity = isExculed ? EXCLUDED_OPACITY : undefined
        const lockLabel = highlightLine !== logLine ? '锁定该行' : '取消锁定'
        const switchHighlight = (): void =>
            setHighlightLine(logLine !== highlightLine ? logLine : -1)
        const copyLog = (): Promise<void> => navigator.clipboard.writeText(logText)
        return (
            <Dropdown
                trigger={['contextMenu']}
                menu={{
                    items: [
                        { key: 'choose', label: lockLabel, onClick: switchHighlight },
                        { key: 'copy', label: '复制', onClick: copyLog }
                    ]
                }}
            >
                <div className="log" style={{ opacity }} onClick={switchHighlight}>
                    <Typography.Text className="logIndex" italic type="secondary">
                        {isHighlight ? <CaretRightOutlined /> : undefined}
                        {logLine >= 0 ? logLine : ''}
                    </Typography.Text>
                    <LogLine
                        rawLogText={rawLogText}
                        isHighlight={isHighlight}
                        manager={manager}
                        getLogColor={getLogColor}
                    />
                </div>
            </Dropdown>
        )
    }
    const lineHeight = Math.max(Math.ceil(token.fontSize * token.lineHeight), 10)
    return (
        <div
            className="logContainer"
            ref={mainRef}
            style={{ ...props.style, position: 'relative' }}
        >
            <ListView
                ref={listRef}
                style={{ height: '100%', inset: '0%' }}
                itemRender={LogRowRenderer}
                count={logCount + 1}
                itemHeight={lineHeight}
            />
            {dragging && (
                <div className="logContainerMask" style={{ zIndex: 100 }}>
                    <Typography.Text>拖曳至此打开日志文件</Typography.Text>
                </div>
            )}
        </div>
    )
}
