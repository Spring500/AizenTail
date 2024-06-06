import { Flex, Typography } from 'antd'
import React from 'react'
import { TitleBar } from './components/title_bar'
import { LoadingOutlined } from '@ant-design/icons'

export const AppLoading: React.FC = function () {
    return (
        <Flex vertical style={{ height: '100%', width: '100%' }}>
            <TitleBar />
            <Flex style={{ flex: 1 }} align="center" justify="center">
                <Typography.Title>
                    <LoadingOutlined />
                    Loading...
                </Typography.Title>
            </Flex>
        </Flex>
    )
}
