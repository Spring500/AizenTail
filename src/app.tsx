import React from 'react';
import { createRoot } from 'react-dom/client';
import { logManager } from './log_manager';
import { LogContainer } from './components/log_container';
import { Component_TitleBar } from './components/title_bar';
import { Component_MenuBar } from './components/menu_bar';
import { Component_RulePanel } from './components/rule_panel';

export function Component_App() {
    const [fileUrl, setFileUrl] = React.useState('file directory' as string);
    const [hint, setHint] = React.useState('');
    logManager.onSetHint = setHint;
    logManager.onSetFileUrl = setFileUrl;

    return <>
        <Component_TitleBar />
        <Component_MenuBar />
        <div className="content">
            <LogContainer />
            <div id='hintBar' className='systemInfo'>
                <div>路径: {fileUrl}</div>
                {hint}
            </div>
        </div></>;
}

const root = createRoot(document.getElementById('app')!);
root.render(<Component_App />);

