type LogMeta = {
    /**该行日志在文件中的起始偏移量 */
    offset: number,
    /**日志是第几行 */
    index: number,
    /**后续去除对text的直接存储 */
    text: string,
}

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