const bindings = require('bindings')
type TLogContainer = {
    new (size: number): TLogContainer
    length(): number
    push(log: string): void
    pushMulti(logs: string): void
    clear(): void
    get(index: number): string
    debugStr(): string
}
export const LogContainer: TLogContainer = bindings('addon').LogContainer
console.log('===================\n测试开始')
console.log('开始测试，初始化容器大小为', 4)
let logContainer: typeof LogContainer | undefined = undefined
try {
    logContainer = new LogContainer(4)
} catch (e) {
    console.log('初始化失败，错误信息：', e)
}
if (!logContainer) {
    console.log('测试结束')
    process.exit(1)
}
// logContainer.push('hello\n123\nworld\n')
// console.log('-----------------\n插入1条多行数据\n', logContainer.debugStr())
console.log('-----------------\n准备插入', 4, '条数据...')
for (let i = 0; i < 4; i++) logContainer.push('line ' + i)
console.log('插入', 4, '条数据\n', logContainer.debugStr())

console.log('-----------------\n准备插入', 1, '条数据...')
for (let i = 4; i < 5; i++) logContainer.push('line ' + i)
console.log('插入', 1, '条数据\n', logContainer.debugStr())

console.log('-----------------\n准备插入', 1, '条数据...')
for (let i = 5; i < 6; i++) logContainer.push('line ' + i)
console.log('插入', 1, '条数据\n', logContainer.debugStr())

console.log('-----------------\n准备插入', 6, '条数据...')
for (let i = 6; i < 12; i++) logContainer.push('line ' + i)
console.log('插入', 6, '条数据\n', logContainer.debugStr())

console.log('-----------------\n准备批量插入', 3, '条数据...')
logContainer.pushMulti('new line 1\nnew line 2\nnew line 3\n')
console.log('批量插入', 3, '条数据\n', logContainer.debugStr())

console.log('-----------------\n准备清空容器')
logContainer.clear()
console.log('清空容器\n', logContainer.debugStr())

console.log('-----------------\n准备清空后插入', 3, '条批量数据...')
logContainer.pushMulti('new line 4\nnew line 5\nnew line 6\n')
console.log('清空后插入', 3, '条批量数据\n', logContainer.debugStr())

console.log('-----------------\n准备插入', 3, '条批量数据...')
logContainer.pushMulti('new line 7\nnew line 8\nnew line 9\n')
console.log('插入', 3, '条批量数据\n', logContainer.debugStr())
console.log('-----------------\n测试结束')
