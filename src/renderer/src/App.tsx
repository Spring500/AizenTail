import React from 'react'
import { TSetting, ruleManager } from './managers/rule_manager'
import { AppMain } from './AppMain'
import { AppLoading } from './AppLoading'

export const App: React.FC = function () {
    const [loading, setLoading] = React.useState(() => {
        console.log('初始化加载中...')
        ruleManager
            .reloadConfig()
            .then((setting) => {
                console.log('加载完毕', setting)
                if (loading) {
                    setLoading(false)
                    setInitSetting(setting ?? {})
                }
            })
            .catch((e) => {
                console.error('加载失败', e)
                if (loading) {
                    setLoading(false)
                }
            })
        return true
    })
    const [initSetting, setInitSetting] = React.useState<TSetting>({})
    return <>{loading ? <AppLoading /> : <AppMain initSetting={initSetting} />}</>
}
