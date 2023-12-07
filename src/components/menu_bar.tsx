import React from 'react';
import { logManager } from '../log_manager';

export function Component_MenuBar() {
    const [autoScroll, setAutoScroll] = React.useState(true);
    const [isFiltering, setIsFiltering] = React.useState(false);
    const [alwaysOnTop, setAlwaysOnTop] = React.useState(false);
    logManager.onSetAutoScroll = setAutoScroll;
    logManager.onSetFiltering = setIsFiltering;
    logManager.onSetAlwaysOnTop = setAlwaysOnTop;

    const onClickOpenFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        file && await logManager.openFile(file)
    }
    const onClickToggleAutoScroll = () => logManager.toggleAutoScroll();
    const onClickToggleFilter = () => logManager.toggleFilter();
    const onClickToggleAlwaysOnTop = () => logManager.setAlwaysOnTop(!alwaysOnTop);

    return <><input type="file" id="openLogButton" onChange={onClickOpenFile} style={{ display: "none" }} />
        <div>
            <button className='menuButton' title='打开日志文件' onClick={() => document.getElementById('openLogButton')?.click()}>打开文件</button>
            <button className='menuButton' title='切换是否当日志内容发生变化时自动滚动&#13;&#10;快捷键：R' onClick={onClickToggleAutoScroll}>{`自动滚动(R): ${autoScroll ? "开" : "关"}`}</button>
            <button className='menuButton' title='切换是否根据setting.config配置筛选日志&#13;&#10;快捷键：F' onClick={onClickToggleFilter}>{`日志筛选(F): ${isFiltering ? "开" : "关"}`}</button>
            <button className='menuButton' title='切换窗口置顶&#13;&#10;快捷键：T' onClick={onClickToggleAlwaysOnTop}>{`窗口置顶(T): ${alwaysOnTop ? "开" : "关"}`}</button>
        </div></>
}