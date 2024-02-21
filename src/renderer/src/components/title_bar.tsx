export function TitleBar() {
    return <div className='titleBar'>
        <div className='titleBarText'>AizenTail</div>
        <button className='titleBarButton' id="minimizeButton" onClick={() => window.electron.windowMinimize()}>▁</button>
        <button className='titleBarButton' id="maximizeButton" onClick={() => window.electron.windowMaximize()}>▢</button>
        <button className='titleBarButton' id="closeButton" onClick={() => window.close()}>╳</button>
    </div >
}