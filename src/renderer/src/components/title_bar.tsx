import { Flex } from "antd";

export function TitleBar() {
    return <Flex className='titleBar' align="center">
        <div className='titleBarText'>AizenTail</div>
        <button className='titleBarButton' id="minimizeButton" onClick={() => window.electron.windowMinimize()}>▁</button>
        <button className='titleBarButton' id="maximizeButton" onClick={() => window.electron.windowMaximize()}>▢</button>
        <button className='titleBarButton' id="closeButton" onClick={() => window.close()}>╳</button>
    </Flex >
}