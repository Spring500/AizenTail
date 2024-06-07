import React from 'react'
import { Button, ColorPicker, Flex, Space, Typography } from 'antd'
import { Color, ColorPickerProps } from 'antd/es/color-picker'
import { red } from '@ant-design/colors'
import { PresetsItem } from 'antd/es/color-picker/interface'
import { UndoOutlined } from '@ant-design/icons'

const presets: PresetsItem[] = [
    {
        label: '预设',
        defaultOpen: true,
        colors: [...red]
    }
]

const getColorStr = (color: Color | undefined): string | undefined => {
    if (!color) return undefined
    return color.cleared ? undefined : color.toHexString()
}

export const RuleColorPicker: React.FC<{
    color: string | undefined
    onChange: (color: string | undefined) => void
    title?: string
    tooltip?: string
}> = function ({ color, onChange, title, tooltip }) {
    const customPanelRender: ColorPickerProps['panelRender'] = (panel) => (
        <Space direction="vertical">
            <Flex justify="space-between">
                <Typography.Title level={5}>{title}</Typography.Title>
                <Button icon={<UndoOutlined />} onClick={() => onChange(undefined)}>
                    还原默认
                </Button>
            </Flex>
            {panel}
        </Space>
    )
    const colorPicker = React.useMemo(() => {
        return (
            <ColorPicker
                // allowClear
                disabledAlpha
                value={color ?? null}
                presets={presets}
                onChangeComplete={(color) => onChange(getColorStr(color))}
                panelRender={customPanelRender}
            />
        )
    }, [color, title, onChange])
    return colorPicker
}
