import * as React from 'react'
import { EditorableTextField } from '../../common/text_field'
import { ItemType } from '../../common/dropdown'
import { ContextWarpper } from '../../common/context_wapper'
import { Checkbox } from 'antd'

const COROR_LIST: [string | undefined, string][] = [
    [undefined, '默认'],
    // 红色系
    ['red', '红色'],
    ['pink', '粉红'],
    // 橙色系
    ['orange', '橙色'],
    ['tomato', '番茄'],
    // 黄色系
    ['yellow', '黄色'],
    ['gold', '金色'],
    // 绿色系
    ['green', '绿色'],
    // 青色系
    ['cyan', '青色'],
    // 蓝色系
    ['blue', '蓝色'],
    // 紫色系
    ['purple', '紫色'],
    // 灰色系
    ['gray', '灰色'],
    ['silver', '银色'],
    ['black', '黑色'],
    ['white', '白色']
]

export const RegexTextField = React.forwardRef(function RegexTextFieldRef(
    prop: {
        fieldName: string
        value: string | undefined
        regexEnable: boolean | undefined
        placeholder?: string
        style?: React.CSSProperties
        title?: string
        onChange: (value: string) => void
        onEnter?: (value: string) => void
        onRegexEnableChange: (enable: boolean) => void
    },
    ref: React.ForwardedRef<HTMLInputElement>
) {
    const inputRef = React.useRef<HTMLInputElement>(null)
    React.useImperativeHandle(ref, () => inputRef.current!)

    const [isEditing, setIsEditing] = React.useState(false)
    const [errorMsg, setErrorMsg] = React.useState('')
    React.useEffect(() => {
        if (!inputRef.current) return
        const input = inputRef.current
        const onFocus = () => setIsEditing(true)
        const onBlur = () => setIsEditing(false)
        input.addEventListener('focus', onFocus)
        input.addEventListener('blur', onBlur)
        return () => {
            input.removeEventListener('focus', onFocus)
            input.removeEventListener('blur', onBlur)
        }
    }, [inputRef])

    React.useEffect(() => {
        try {
            prop.regexEnable && prop.value && new RegExp(prop.value)
            setErrorMsg('')
        } catch (e) {
            let message = '正则表达式错误'
            if (e instanceof Error) {
                message = prop.value ? e.message.replace(`/${prop.value}/:`, '') : e.message
            }
            setErrorMsg(message)
        }
    }, [prop.value])

    const renderHint = () => {
        if (!errorMsg || !isEditing) return
        return (
            <div style={{ position: 'relative', height: '100%' }}>
                <div
                    className="fieldHint"
                    style={{ position: 'absolute', bottom: '100%', left: 0, color: 'red' }}
                >
                    {errorMsg}
                </div>
            </div>
        )
    }

    return (
        <>
            <span style={{ color: errorMsg ? 'red' : undefined }}>{prop.fieldName}</span>
            {renderHint()}
            <EditorableTextField
                value={prop.value}
                placeholder={prop.placeholder}
                title={prop.title}
                onChange={prop.onChange}
                onEnter={prop.onEnter}
                ref={inputRef}
                style={{ ...prop.style, border: errorMsg ? '1px solid red' : undefined }}
            />
            <Checkbox
                className={'ruleCheckBox'}
                checked={prop.regexEnable}
                onChange={() => prop.onRegexEnableChange(!prop.regexEnable)}
            >
                正则匹配
            </Checkbox>
        </>
    )
})

export const RuleLineWarpper = function (prop: {
    children: React.ReactNode
    index: number
    enable: boolean
    ruleCount: number
    menuItems?: {
        key: string
        name: string | (() => string)
        disabled?: boolean
        callback: () => void
    }[]
    onRuleUp: () => void
    onRuleDown: () => void
    onRuleEnable: () => void
    onRuleDelete: () => void
}) {
    const menuItems: ItemType[] = []
    for (const item of prop.menuItems ?? []) {
        menuItems.push({ ...item })
    }
    menuItems.push({
        key: 'up',
        name: '上移规则',
        disabled: prop.index <= 0,
        callback: prop.onRuleUp
    })
    menuItems.push({
        key: 'down',
        name: '下移规则',
        disabled: prop.index >= prop.ruleCount - 1,
        callback: prop.onRuleDown
    })
    menuItems.push({
        key: 'enable',
        name: () => (prop.enable ? '禁用规则' : '启用规则'),
        callback: prop.onRuleEnable
    })
    menuItems.push({ key: 'del', name: '删除规则', callback: prop.onRuleDelete })

    return (
        <ContextWarpper key={prop.index} className="ruleLine" menuItems={menuItems}>
            <button
                className={prop.enable ? 'ruleButton activatedButton' : 'ruleButton'}
                onClick={prop.onRuleEnable}
                title="是否启用该规则"
            >
                {' '}
                启用
            </button>
            {prop.children}
            <div className="fixedRuleBlock">
                <button
                    className="ruleButton"
                    onClick={prop.onRuleUp}
                    title="将该条规则上移一行"
                    disabled={prop.index <= 0}
                >
                    上移
                </button>
                <button
                    className="ruleButton"
                    onClick={prop.onRuleDown}
                    title="将该条规则下移一行"
                    disabled={prop.index >= prop.ruleCount - 1}
                >
                    下移
                </button>
                <button className="ruleButton" onClick={prop.onRuleDelete} title="删除该条规则">
                    删除
                </button>
            </div>
        </ContextWarpper>
    )
}
