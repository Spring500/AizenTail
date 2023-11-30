import React from 'react';
import { createRoot } from 'react-dom/client';
import { FixedSizeList } from "react-window";

// TODO：(1)优化内存占用，不要直接存储text，而是存储offset，然后在渲染的时候去文件中读取
// TODO：(2)优化性能，把LogMeta拆分成多个分页，避免生成超大的数组
// TODO：(3)增加过滤功能，可以根据关键字过滤日志
// TODO：(4)增加自动滚动功能，可以根据日志的增加自动滚动到最新的日志
// TODO：(5)允许用户自定义高亮、过滤规则

type LogMeta = {
    /**该行日志在文件中的起始偏移量 */
    offset: number,
    /**日志是第几行 */
    index: number,
    /**后续去除对text的直接存储 */
    text: string,
}

const logData = {
    logs: [] as LogMeta[],
}

const rules = {
    color: [
        {
            color: 'red',
            reg: /error/i,
        },
        {
            background: 'green',
            reg: /Wwise/i,
        },
        {
            color: 'yellow',
            reg: /warn/i,
        }
    ],
    replacing: [
        {
            reg: /^\[(\d+.\d+.\d+-(\d+)\.(\d+)\.(\d+):(\d+))\]\[\s*(\d+)\]/,
            replace: '[$2:$3:$4.$5($6帧)]',
        },
        {
            reg: /\[GameThread\].*\[(信息|警告|错误)\]/,
            replace: '[$1]',
        },
        {
            reg: /\[(信息|警告|错误)\]\[(\w+)\](\[[^\[\]]+\])*/,
            replace: '[$1][$2]',
        },
        {
            reg: /D:\\aki\\Source\\Client/,
            replace: ' ..项目路径',
        },
        {
            reg: /Puerts: \(0x[0-9a-fA-F]+\)?/,
            replace: '',
        },
    ],
    filter: [
        {
            reg: /buff/,
            exclude: false,
        },
    ]
}
function getLogLine(index: number) {
    return logData.logs[index] ?? '';
}
function checkLogColor(log: string):{background?:string, color?:string} {
    for (const rule of rules.color) {
        if (rule.reg.test(log)) {
            return rule;
        }
    };
    return {};
}
function replaceLog(log: string) {
    for (const rule of rules.replacing) {
        if (rule.reg.test(log)) {
            log = log.replace(rule.reg, rule.replace);
        }
    };
    return log;
}

function Row({ index = 0, style }: {
    index?: number,
    style: React.CSSProperties
}) {
    const log = getLogLine(index);
    const text = log.text;
    const replacedText = replaceLog(text);
    const color = checkLogColor(replacedText);
    return <div className="content" style={{ ...style, minWidth:"110%", backgroundColor: color.background, color:color.color }}>
        <i style={{position:"relative", userSelect:"none", color: "#ffffff77", marginRight:10, marginLeft:20,}}>{index}</i>
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
        console.log('div', div);
        if (!div) return;
        const resize = new ResizeObserver((e) => {
            if (!Array.isArray(e) || !e.length) return;
            for (const ent of e)
                setScale(ent.contentRect.height - 20);
        });
        // 传入监听对象
        resize.observe(logContainerRef.current);
        // 及时销毁监听函数（重要!!!）
        return () => { resize.unobserve(logContainerRef?.current!); };
    }, []);
    const onOpenFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        console.log('打开文件', event);
        const file = event.target.files?.[0];
        // file.slice(0, 1000); file.slice
        if (!file){
            return;
        }
        const start = Date.now();
        // reader.onload = () => {
        file.text().then((resultText) => {
            // if (typeof reader.result !== 'string') return;
            const result = resultText.split('\n');
            logData.logs.length = 0;
            for (let i = 0; i < result.length; i++) {
                logData.logs.push({ offset: 0, index: i, text: result[i], });
            }
            setFileName(file.name);
            setFileUrl(file.path);
            setLogCount(result.length);
            // 等待列表刷新完毕后，滚动到最后一行
            setTimeout(() => logListRef.current?.scrollToItem(logData.logs.length - 1), 0);
            setHint(`打开文件耗时：${Date.now() - start}ms`);
        });

        // reader.readAsText(file);
        
    }
    return <div style={{ flex: "1 1 auto", display: "flex", flexDirection: "column"}}>
        <div 
            className="title"
            style={{ flex: "none"}}>
            <div><h1>{fileName}</h1>{fileUrl}</div>
            <input type="file" onChange={onOpenFile} name={"日志文件路径"} />
            {hint}
        </div>
        <div className="logContainer"
            style={{ flex: "auto" }} 
            ref={logContainerRef}>
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
    </div>;
}

const root = createRoot(document.getElementById('app')!);
root.render(<App />);

