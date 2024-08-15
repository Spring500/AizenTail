const bindings = require('bindings')

type TLogContainer = {
    new (size: number): TLogContainer
    length(): number
    filtedLength(): number
    push(log: string): void
    pushMulti(logs: string): void
    clear(): void
    get(index: number): string
    debugStr(): string
    setRules(
        rules: {
            enable: boolean
            reg: string
            regexEnable: boolean
            ignoreCase: boolean
            exclude: boolean
        }[]
    ): void
}

export const LogContainer: TLogContainer = bindings('addon').LogContainer
