export function checkRegExp(reg: string | undefined): boolean {
    try {
        if (!reg) return false;
        new RegExp(reg);
        return true;
    } catch (e) {
        return false;
    }
}