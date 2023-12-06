import React from 'react';
import { logManager } from '../log_manager';

export function Component_MenuBar() {
    const [autoScroll, setAutoScroll] = React.useState(true);
    const [isFiltering, setIsFiltering] = React.useState(false);

    const onOpenFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        file && await logManager.openFile(file)
    }

    return <><input type="file" id="openLogButton" onChange={onOpenFile} style={{ display: "none" }} />
        <div>
            <button className='menuButton' onClick={() => document.getElementById('openLogButton')?.click()}>打开文件</button>
            <button className='menuButton' onClick={() => { logManager.toggleAutoScroll(); setAutoScroll(logManager.autoScroll) }}>{`自动滚动: ${autoScroll ? "开" : "关"}`}</button>
            <button className='menuButton' onClick={() => { logManager.toggleFilter(); setIsFiltering(logManager.isFiltering) }}>{`日志筛选: ${isFiltering ? "开" : "关"}`}</button>
        </div></>
}