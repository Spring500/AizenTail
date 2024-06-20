import { Button, Typography } from 'antd'
import React from 'react'
import { MinusOutlined, BorderOutlined, CloseOutlined } from '@ant-design/icons'
import * as packageJson from '../../../../package.json'
export const TitleBar: React.FC = function () {
    const [version] = React.useState(packageJson.version)
    return (
        <div className="titleBar">
            <Typography.Text className="titleBarText">
                AizenTail{version ? ` v${version}` : ''}
            </Typography.Text>
            <Button
                type="text"
                className="titleBarButton"
                icon={<MinusOutlined />}
                onClick={() => window.electron.windowMinimize()}
            ></Button>
            <Button
                type="text"
                className="titleBarButton"
                icon={<BorderOutlined />}
                onClick={() => window.electron.windowMaximize()}
            ></Button>
            <Button
                danger
                type="text"
                className="titleBarButton"
                icon={<CloseOutlined />}
                onClick={() => window.close()}
            ></Button>
        </div>
    )
}
