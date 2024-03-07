type ColorConfig = {
    color?: string,
    background?: string,
    reg: string,
    enable?: boolean,
    regexEnable?: boolean,
}

type ReplaceConfig = {
    reg: string,
    replace: string,
    enable?: boolean,
    regexEnable?: boolean,
}

type FilterConfig = {
    reg: string,
    exclude: boolean,
    enable?: boolean,
    regexEnable?: boolean,
}

type LogConfig = {
    colorRules: ColorConfig[],
    replaceRules: ReplaceConfig[],
    filterRules: FilterConfig[],
}