type LogMeta = {
    /**该行日志在文件中的起始偏移量 */
    offset: number,
    /**日志是第几行 */
    index: number,
    /**后续去除对text的直接存储 */
    text: string,
}

type ColorConfig = {
    index: number,
    color?: string,
    background?: string,
    reg: string,
    enable?: boolean,
}

type ReplaceConfig = {
    index: number,
    reg: string,
    replace: string,
    enable?: boolean,
}

type FilterConfig = {
    index: number,
    reg: string,
    exclude: boolean,
    enable?: boolean,
}

type LogConfig = {
    colorRules: ColorConfig[],
    replaceRules: ReplaceConfig[],
    filterRules: FilterConfig[],
}