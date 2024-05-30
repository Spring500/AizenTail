import React, { useState } from 'react'
import { Collapse, Slider } from 'antd'
import { RuleLine_Color, RuleLine_Filter, RuleLine_Replace } from './rule_line'

export const RulePanel: React.FC<{
    replaceRules: ReplaceConfig[]
    setReplaceRules: (replaceRules: ReplaceConfig[]) => void
    colorRules: ColorConfig[]
    setColorRules: (colorRules: ColorConfig[]) => void
    filterRules: FilterConfig[]
    setFilterRules: (filterRules: FilterConfig[]) => void
}> = function (props) {
    const [logLimit, setLogLimit] = useState(0)
    return (
        <div className="ruleContainer" style={{ padding: '4px' }}>
            <Collapse
                items={[
                    {
                        key: '0',
                        label: '基础设定',
                        children: (
                            <div style={{ width: '100%' }}>
                                <span>日志上限</span>
                                <div style={{ width: '50%' }}>
                                    <Slider
                                        min={0}
                                        max={100000}
                                        defaultValue={30}
                                        step={10000}
                                        marks={{
                                            0: '0',
                                            50000: '50000',
                                            100000: '100000'
                                        }}
                                        value={typeof logLimit === 'number' ? logLimit : 0}
                                        onChange={(value) => setLogLimit(value)}
                                        tooltip={{
                                            formatter: (value) => (value ? value : '无限制')
                                        }}
                                        // style={{ margin: '0 20px' }}
                                    />
                                </div>
                            </div>
                        )
                    },
                    {
                        key: '1',
                        label: '颜色规则',
                        children: props.colorRules.map((_, index) => (
                            <RuleLine_Color
                                key={index}
                                index={index}
                                rules={props.colorRules}
                                setRules={props.setColorRules}
                            />
                        ))
                    },
                    {
                        key: '2',
                        label: '替换规则',
                        children: props.replaceRules.map((_, index) => (
                            <RuleLine_Replace
                                key={index}
                                index={index}
                                rules={props.replaceRules}
                                setRules={props.setReplaceRules}
                            />
                        ))
                    },
                    {
                        key: '3',
                        label: '过滤规则',
                        children: props.filterRules.map((_, index) => (
                            <RuleLine_Filter
                                key={index}
                                index={index}
                                rules={props.filterRules}
                                setRules={props.setFilterRules}
                            />
                        ))
                    }
                ]}
                defaultActiveKey={['1', '2', '3']}
            ></Collapse>
        </div>
    )
}

// export const RulePanel: React.FC<{
//     replaceRules: ReplaceConfig[]
//     setReplaceRules: (replaceRules: ReplaceConfig[]) => void
//     colorRules: ColorConfig[]
//     setColorRules: (colorRules: ColorConfig[]) => void
//     filterRules: FilterConfig[]
//     setFilterRules: (filterRules: FilterConfig[]) => void
// }> = function (props) {
//     const renderColorRuleList = (): React.ReactNode => {
//         const addRule = (): void => props.setColorRules([...props.colorRules, { reg: '' }])
//         return (
//             <>
//                 <div className="ruleTitleText">颜色规则</div>
//                 {props.colorRules.map((_, index) => (
//                     <RuleLine_Color
//                         key={index}
//                         index={index}
//                         rules={props.colorRules}
//                         setRules={props.setColorRules}
//                     />
//                 ))}
//                 <div className="ruleLine">
//                     <button className="ruleButton" onClick={addRule}>
//                         添加规则
//                     </button>
//                 </div>
//             </>
//         )
//     }

//     const renderReplaceRuleList = (): React.ReactNode => {
//         const addRule = (): void =>
//             props.setReplaceRules([...props.replaceRules, { reg: '', replace: '' }])
//         return (
//             <>
//                 <div className="ruleTitleText">替换规则</div>
//                 {props.replaceRules.map((_, index) => (
//                     <RuleLine_Replace
//                         key={index}
//                         index={index}
//                         rules={props.replaceRules}
//                         setRules={props.setReplaceRules}
//                     />
//                 ))}
//                 <div className="ruleLine">
//                     <button className="ruleButton" onClick={addRule}>
//                         添加规则
//                     </button>
//                 </div>
//             </>
//         )
//     }

//     const renderFilterRuleList = (): React.ReactNode => {
//         const addRule = (): void =>
//             props.setFilterRules([...props.filterRules, { reg: '', exclude: false }])
//         return (
//             <>
//                 <div className="ruleTitleText">过滤规则</div>
//                 {props.filterRules.map((_, index) => (
//                     <RuleLine_Filter
//                         key={index}
//                         index={index}
//                         rules={props.filterRules}
//                         setRules={props.setFilterRules}
//                     />
//                 ))}
//                 <div className="ruleLine">
//                     <button className="ruleButton" onClick={addRule}>
//                         添加规则
//                     </button>
//                 </div>
//             </>
//         )
//     }

//     return (
//         <div className="ruleContainer">
//             {renderColorRuleList()}
//             {renderReplaceRuleList()}
//             {renderFilterRuleList()}
//         </div>
//     )
// }
