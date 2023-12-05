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
    reg: RegExp,
}

type ReplaceConfig = {
    reg: RegExp,
    replace: string,
}

type FilterConfig = {
    reg: RegExp,
    exclude: false
}

type LogConfig = {
    color: ColorConfig[],
    replacing: ReplaceConfig[],
    filter: FilterConfig[],
}