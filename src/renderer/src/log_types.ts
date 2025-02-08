/* eslint-disable @typescript-eslint/no-unused-vars */
type FilterConfig = {
    color?: string
    background?: string
    reg?: string
    enable?: boolean
    regexEnable?: boolean
    filterType?: 'INCLUDE' | 'EXCLUDE' | undefined
    dyeing?: boolean
}

type ReplaceConfig = {
    reg?: string
    replace?: string
    enable?: boolean
    regexEnable?: boolean
}
