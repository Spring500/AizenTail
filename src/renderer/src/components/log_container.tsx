import { ILogManager } from '../managers/log_manager'
import { IListView, ListView } from './common/list'
import React, { useEffect, useState } from 'react'
import { createRef } from 'react'
import { Dropdown, Typography, theme } from 'antd'
import { RuleContext, SettingContext } from '@renderer/context'
import { CaretRightOutlined } from '@ant-design/icons'

const EXCLUDED_OPACITY = 0.3

const splitLog = function (text: string, keywords: string[]): React.ReactNode {
    let splitedText = text
    for (const keyword of keywords) {
        const plainedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        splitedText = splitedText.replace(new RegExp(`(${plainedKeyword})`, 'gi'), '\x01\x02$1\x01')
    }
    return splitedText.split('\x01').map((text, index) => {
        if (text[0] !== '\x02') return <span key={index}>{text}</span>
        return (
            <span className="logSearchHit" key={index}>
                {text.substring(1)}
            </span>
        )
    })
}

export const LogContainer: React.FC<{
    style?: React.CSSProperties
    manager: ILogManager
    onChangeFile: (file: File | null) => void
}> = function (props) {
    const { token } = theme.useToken()
    const settingContext = React.useContext(SettingContext)
    const ruleContext = React.useContext(RuleContext)
    const mainRef = createRef<HTMLDivElement>()
    const listRef = createRef<IListView>()
    const [dragging, setDragging] = useState(false)
    const [logCount, setLogCount] = useState(0)
    const [highlightLine, setHighlightLine] = useState(-1)

    const currentRuleSet = ruleContext?.rules?.[settingContext?.currentRuleSet ?? '']
    const replaceRules = currentRuleSet?.replaceRules ?? []
    const filterRules = currentRuleSet?.filterRules ?? []

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

    const onTick = function (): void {
        props.manager.refreshFile()
    }
    // 监听manager的变化
    useEffect(() => {
        const manager = props.manager
        if (!manager) return
        manager.onSetLogCount = setLogCount
        const timer = setInterval(onTick, 100)
        return () => {
            if (manager.onSetLogCount === setLogCount) manager.onSetLogCount = null
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
        if (!settingContext?.isAutoScroll) return
        if (highlightLine !== -1) {
            const index = props.manager.lineToIndex(highlightLine)
            if (index !== -1) scrollToItem(index)
        } else {
            scrollToItem(
                settingContext?.isFiltering
                    ? props.manager.filtedLogIds.length - 1
                    : props.manager.logs.length - 1
            )
        }
    }, [logCount, settingContext?.isFiltering])

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
            if (rule.exclude) hitted = !hitted
            if (!hitted) continue

            return {
                backgroundColor: rule.background,
                color: rule.color
            }
        }
        return {}
    }

    const hasFilter = filterRules.length > 0 && filterRules.some((rule) => rule.enable)

    const LogRowRenderer = function (index: number): React.ReactNode {
        const manager = props.manager
        const logText = replaceLog(manager.getLogText(index))
        const line = props.manager.indexToLine(index)
        const isExculed =
            !settingContext?.isFiltering && hasFilter && !manager.lineToIndexMap.has(index)
        const isHighlight = line >= 0 && line === highlightLine
        const onClick = (): void => setHighlightLine(line !== highlightLine ? line : -1)

        const opacity = isExculed ? EXCLUDED_OPACITY : undefined
        return (
            <Dropdown
                trigger={['contextMenu']}
                menu={{
                    items: [
                        { key: 'choose', label: '选择', onClick: () => setHighlightLine(line) },
                        {
                            key: 'copy',
                            label: '复制',
                            onClick: () => navigator.clipboard.writeText(logText)
                        }
                    ]
                }}
            >
                <div className="log" style={{ opacity }} onClick={onClick}>
                    <Typography.Text className="logIndex" italic type="secondary">
                        {isHighlight ? <CaretRightOutlined /> : undefined}
                        {line >= 0 ? line : ''}
                    </Typography.Text>
                    <Typography.Text
                        className={`logText${isHighlight ? ' highlightLogText' : ''}`}
                        title={settingContext?.isShowHoverText ? logText : undefined}
                        style={{ ...getLogColor(logText), whiteSpace: 'pre' }}
                    >
                        {splitLog(logText, manager.inputFilters)}
                        <br />
                    </Typography.Text>
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
                count={logCount}
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
