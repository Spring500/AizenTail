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
    const onInputFilter = (event: React.ChangeEvent<HTMLInputElement>) => logManager.setInputFilter(event.target.value);
    const onClickToggleAutoScroll = () => logManager.toggleAutoScroll();
    const onClickToggleFilter = () => logManager.toggleFilterSetting();
    const onClickToggleAlwaysOnTop = () => logManager.setAlwaysOnTop(!alwaysOnTop);

    return <><input type="file" id="openLogButton" onChange={onClickOpenFile} style={{ display: "none" }} />
        <div className='menuBar'>
            <button className='menuButton' title='打开日志文件' onClick={() => document.getElementById('openLogButton')?.click()}>打开文件</button>
            <button className='menuButton' title='切换是否当日志内容发生变化时自动滚动&#13;&#10;快捷键：Alt+R' onClick={onClickToggleAutoScroll}>{`滚动(R): ${autoScroll ? "开" : "关"}`}</button>
            <button className='menuButton' title='切换是否根据setting.config配置筛选日志&#13;&#10;快捷键：Alt+F' onClick={onClickToggleFilter}>{`筛选(F): ${isFiltering ? "开" : "关"}`}</button>
            <button className='menuButton' title='切换窗口置顶&#13;&#10;快捷键：Alt+T' onClick={onClickToggleAlwaysOnTop}>{`置顶(T): ${alwaysOnTop ? "开" : "关"}`}</button>
            <input type="text" className='menuFilter' placeholder='搜索日志' onChange={onInputFilter} />
        </div></>
}