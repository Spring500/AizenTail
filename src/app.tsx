import React from 'react';
import { createRoot } from 'react-dom/client';
import { logManager } from './log_manager';
import { Component_LogContainer } from './components/log_container';
import { Component_TitleBar } from './components/title_bar';
import { Component_MenuBar } from './components/menu_bar';

// TODO：(1)优化内存占用，不要直接存储text，而是存储offset，然后在渲染的时候去文件中读取
// TODO：(2)优化性能，把LogMeta拆分成多个分页，避免生成超大的数组
// TODO：(3)增加规则配置界面，让用户不用直接编辑setting.json

export function Component_App() {
    const [fileUrl, setFileUrl] = React.useState('file directory' as string);
    const [hint, setHint] = React.useState('');
    logManager.onSetHint = setHint;
    logManager.onSetFileUrl = setFileUrl;

    return <>
        <Component_TitleBar />
        <Component_MenuBar />
        <div className="content">
            <Component_LogContainer />
            <div id='hintBar' className='systemInfo'>
                <div>路径: {fileUrl}</div>
                {hint}
            </div>
        </div></>;
}

const root = createRoot(document.getElementById('app')!);
root.render(<Component_App />);

