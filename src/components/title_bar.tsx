import React from 'react';
import { logManager } from '../log_manager';

export function Component_TitleBar() {
    const [fileName, setFileName] = React.useState('Filename' as string);
    logManager.onSetFileName = setFileName;

    return <div className='titleBar'>
        <div className='titleBarText'>{fileName}</div>
        <button className='titleBarButton' id="minimizeButton" onClick={() => (window as any).electron.windowMinimize()}>▁</button>
        <button className='titleBarButton' id="maximizeButton" onClick={() => (window as any).electron.windowMaximize()}>▢</button>
        <button className='titleBarButton' id="closeButton" onClick={() => window.close()}>╳</button>
    </div >
}