import React from 'react';

export function Component_TitleBar() {
    return <div className='titleBar'>
        <div className='titleBarText'>AizenTail</div>
        <button className='titleBarButton' id="minimizeButton" onClick={() => (window as any).electron.windowMinimize()}>▁</button>
        <button className='titleBarButton' id="maximizeButton" onClick={() => (window as any).electron.windowMaximize()}>▢</button>
        <button className='titleBarButton' id="closeButton" onClick={() => window.close()}>╳</button>
    </div >
}