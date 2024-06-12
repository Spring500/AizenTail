import React from 'react'
import { Space, Checkbox } from 'antd'
import { SettingContext } from '@renderer/context'

export const SettingPanel: React.FC = function () {
    const {
        isShowHoverText,
        setIsShowHoverText,
        isAlwaysOnTop,
        setIsAlwaysOnTop,
        isCompactMode,
        setIsCompactMode,
        isFiltering,
        setIsFiltering,
        colorTheme,
        setColorTheme
    } = React.useContext(SettingContext)
    return (
        <Space direction="vertical">
            <Space direction="vertical">
                {/* <InputNumber
            min={0}
            max={100000}
            addonBefore={'日志上限'}
            variant="filled"
            keyboard
            value={logLimit}
            onChange={(value) => setLogLimit(value ?? 0)}
            formatter={(value) =>
                value && value > 0 ? value + '' : '无限制'
            }
        /> */}
                <Checkbox
                    checked={isShowHoverText}
                    onChange={(e) => setIsShowHoverText(e.target.checked)}
                >
                    日志悬浮提示
                </Checkbox>
            </Space>
            <Checkbox checked={isAlwaysOnTop} onChange={(e) => setIsAlwaysOnTop(e.target.checked)}>
                窗口置顶
            </Checkbox>
            <Checkbox checked={isCompactMode} onChange={(e) => setIsCompactMode(e.target.checked)}>
                紧凑模式
            </Checkbox>
            <Checkbox checked={isFiltering} onChange={(e) => setIsFiltering(e.target.checked)}>
                仅显示过滤规则匹配的日志
            </Checkbox>
            <Checkbox
                checked={colorTheme === 'dark'}
                onChange={(e) => setColorTheme(e.target.checked ? 'dark' : 'light')}
            >
                暗色主题
            </Checkbox>
        </Space>
    )
}
