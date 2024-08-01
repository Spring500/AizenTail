const bindings = require('bindings')
export const addon: {
    hello: () => string
} = bindings('addon.node')

type TLogContainer = {
    new (size: number): TLogContainer
    length(): number
    push(log: string): void
    pushMulti(logs: string): void
    clear(): void
    get(index: number): string
    debugStr(): string
}

export const LogContainer: TLogContainer = bindings.LogContainer
