import React from 'react'
import { Space, Checkbox, Card } from 'antd'
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
        setColorTheme,
        isAutoScroll,
        setIsAutoScroll
    } = React.useContext(SettingContext)
    return (
        <Space direction="vertical">
            <Card title="规则设置" size="small">
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
                <Space direction="vertical">
                    <Checkbox
                        checked={isShowHoverText}
                        onChange={(e) => setIsShowHoverText(e.target.checked)}
                    >
                        日志悬浮提示
                    </Checkbox>

                    <Checkbox
                        checked={isFiltering}
                        onChange={(e) => setIsFiltering(e.target.checked)}
                    >
                        仅显示过滤规则匹配的日志
                    </Checkbox>
                    <Checkbox
                        checked={isAutoScroll}
                        onChange={(e) => setIsAutoScroll(e.target.checked)}
                    >
                        日志文件发生更新时自动滚动
                    </Checkbox>
                </Space>
            </Card>
            <Card title="主题设置" size="small" style={{ width: '100%' }}>
                <Checkbox
                    checked={colorTheme === 'dark'}
                    onChange={(e) => setColorTheme(e.target.checked ? 'dark' : 'light')}
                >
                    暗色主题
                </Checkbox>
                <Checkbox
                    checked={isCompactMode}
                    onChange={(e) => setIsCompactMode(e.target.checked)}
                >
                    紧凑模式
                </Checkbox>
                <Checkbox
                    checked={isAlwaysOnTop}
                    onChange={(e) => setIsAlwaysOnTop(e.target.checked)}
                >
                    窗口置顶
                </Checkbox>
            </Card>
        </Space>
    )
}
