import { LogContainer } from '../src/main/addon'
import * as SegfaultHandler from 'segfault-handler'
SegfaultHandler.registerHandler('crash.log')

console.log('===================\n测试开始')
console.log('开始测试，初始化容器大小为', 4)
let logMgr: typeof LogContainer | undefined = undefined
try {
    logMgr = new LogContainer(4)
} catch (e) {
    console.log('初始化失败，错误信息：', e)
}
if (!logMgr) {
    console.log('测试结束')
    process.exit(1)
}
// logContainer.push('hello\n123\nworld\n')
// console.log('-----------------\n插入1条多行数据\n', logContainer.debugStr())
console.log('-----------------\n准备插入', 4, '条数据...')
for (let i = 0; i < 4; i++) logMgr.push('line ' + i)
console.log('插入', 4, '条数据\n', logMgr.debugStr())

console.log('-----------------\n准备插入', 1, '条数据...')
for (let i = 4; i < 5; i++) logMgr.push('line ' + i)
console.log('插入', 1, '条数据\n', logMgr.debugStr())

console.log('-----------------\n准备插入', 1, '条数据...')
for (let i = 5; i < 6; i++) logMgr.push('line ' + i)
console.log('插入', 1, '条数据\n', logMgr.debugStr())

console.log('-----------------\n准备插入', 6, '条数据...')
for (let i = 6; i < 12; i++) logMgr.push('line ' + i)
console.log('插入', 6, '条数据\n', logMgr.debugStr())

console.log('-----------------\n准备批量插入', 3, '条数据...')
logMgr.pushMulti('new line 1\nnew line 2\nnew line 3\n')
console.log('批量插入', 3, '条数据\n', logMgr.debugStr())

console.log('-----------------\n准备清空容器')
logMgr.clear()
console.log('清空容器\n', logMgr.debugStr())

console.log('-----------------\n准备清空后插入', 3, '条批量数据...')
logMgr.pushMulti('new line 4\nnew line 5\nnew line 6\n')
console.log('清空后插入', 3, '条批量数据\n', logMgr.debugStr())

console.log('-----------------\n准备插入', 3, '条批量数据...')
logMgr.pushMulti('new line 7\nnew line 8\nnew line 9\n')
console.log('插入', 3, '条批量数据\n', logMgr.debugStr())

console.log('-----------------\n获取第', 3, '个条目...')
console.log('第', 3, '个条目：', logMgr.get(3))

console.log('-----------------\n获取第', 0, '个条目...')
console.log('第', 0, '个条目：', logMgr.get(0))

console.log('-----------------\n获取第', 8, '个条目...')
try {
    console.log('第', 8, '个条目：', logMgr.get(8))
} catch (e) {
    console.error('获取失败，错误信息：', e)
}

console.log('-----------------\n添加筛选规则...')
try {
    logMgr.setRules([
        {
            enable: true,
            reg: '8',
            regexEnable: false,
            ignoreCase: false,
            exclude: false
        },
        {
            enable: true,
            reg: '(1|2|6)',
            regexEnable: true,
            ignoreCase: false,
            exclude: false
        },
        {
            enable: true,
            reg: '9',
            regexEnable: false,
            ignoreCase: false,
            exclude: false
        }
    ])
} catch (e) {
    console.error('添加筛选规则失败，错误信息：', e)
}
console.log('规则添加完毕, ', logMgr.length(), '条数据，', logMgr.filtedLength(), '条命中')
console.log(logMgr.debugStr())

console.log('-----------------\n添加筛选规则...')
logMgr.setRules([
    {
        enable: true,
        reg: 'line\\s*([1234567])',
        regexEnable: false,
        ignoreCase: false,
        exclude: false
    }
])
console.log('规则添加完毕, ', logMgr.length(), '条数据，', logMgr.filtedLength(), '条命中')
console.log(logMgr.debugStr())

console.log('-----------------\n测试结束')
