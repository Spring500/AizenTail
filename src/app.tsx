import React from 'react';
import { createRoot } from 'react-dom/client';
import { FixedSizeList } from "react-window";
import { logManager } from './log_manager';

// TODO：(1)优化内存占用，不要直接存储text，而是存储offset，然后在渲染的时候去文件中读取
// TODO：(2)优化性能，把LogMeta拆分成多个分页，避免生成超大的数组
// TODO：(3)增加过滤功能，可以根据关键字过滤日志
// TODO：(4)增加自动滚动功能开关
// TODO：(5)增加规则配置界面，让用户不用直接编辑setting.json


function Row({ index = 0, style }: {
    index?: number,
    style: React.CSSProperties
}) {
    const log = logManager.getLogLine(index);
    const text = log.text;
    const replacedText = logManager.getLogReplacing(text);
    const color = logManager.getLogColor(replacedText);
    return <div className="log" style={{ ...style, backgroundColor: color.background, color: color.color }}>
        <div className="logIndex">{index}</div>
        {replacedText}
    </div >
}

const ItemWrapper = ({ data, index, style }: {
    data: { ItemRenderer: React.ComponentType<{ index: number, style: React.CSSProperties }> },
    index: number,
    style: React.CSSProperties,
}) => {
    const { ItemRenderer } = data;
    return <ItemRenderer index={index} style={style} />;
};



export function App() {
    const [logCount, setLogCount] = React.useState(0);
    const [fileName, setFileName] = React.useState('Filename' as string);
    const [fileUrl, setFileUrl] = React.useState('file directory' as string);
    const [hint, setHint] = React.useState('');
    const [scale, setScale] = React.useState(300);
    const logContainerRef = React.useRef<HTMLDivElement>(null);
    const logListRef = React.useRef<FixedSizeList>(null);

    React.useEffect(() => {
        const div = logContainerRef.current;
        if (!div) return;

        const resize = new ResizeObserver((e) => {
            setScale(div.getBoundingClientRect().height)
        });
        // 传入监听对象
        resize.observe(logContainerRef.current);
        // 及时销毁监听函数（重要!!!）
        return () => { resize.unobserve(logContainerRef?.current!); };
    }, []);
    const onOpenFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
        console.log('打开文件', event);
        setHint(`正在打开文件...`);
        const file = event.target.files?.[0];
        if (!file) {
            setHint(`打开文件失败`);
            return;
        }
        const start = Date.now();
        await logManager.openFile(file.path);
        setFileName(file.name);
        setFileUrl(file.path);
        setHint(`打开文件耗时：${Date.now() - start}ms`);
    }
    logManager.onRefreshFilter = (isFiltering) => {
        console.log('刷新过滤')
        if (isFiltering) {
            setHint(`开启过滤`);
            setLogCount(logManager.filtedLogIds.length);
            setTimeout(() => logListRef.current?.scrollToItem(logManager.filtedLogIds.length - 1), 0);
        } else {
            setHint(`关闭过滤`);
            setLogCount(logManager.logs.length);
            setTimeout(() => logListRef.current?.scrollToItem(logManager.logs.length - 1), 0);
        }
    }

    const closeWindow = () => window.close();
    document.onkeyup = (e) => {
        switch (e.key) {
            case 'h':
                if (e.ctrlKey) logManager.toggleFilter();
                break;
            case 'F12':
                (window as any).electron.openDevTools();
                break;
        }
    }
    return <>
        <div className='titleBar'>
            <div className='titleBarText'>{fileName}</div>
            <button className='titleBarButton' id="minimizeButton" onClick={() => null}>▁</button>
            <button className='titleBarButton' id="maximizeButton" onClick={() => null}>▢</button>
            <button className='titleBarButton' id="closeButton" onClick={closeWindow}>╳</button>
        </div >
        <div className="content">
            <input type="file" onChange={onOpenFile} name={"日志文件路径"} />
            <div className="logContainer" ref={logContainerRef}>
                <FixedSizeList
                    className="logList"
                    ref={logListRef}
                    itemData={{ ItemRenderer: Row }}
                    height={scale} itemCount={logCount}
                    itemSize={17} width={""}
                    overscanCount={10}
                >
                    {ItemWrapper}
                </FixedSizeList>
            </div>
            <div id='hintBar' className='systemInfo'>
                <div>{fileUrl}</div>
                {hint}
            </div>
        </div></>;
}

const root = createRoot(document.getElementById('app')!);
root.render(<App />);

