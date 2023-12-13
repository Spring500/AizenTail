import React from 'react';
import { createRoot } from 'react-dom/client';
import { logManager } from './managers/log_manager';
import { LogContainer } from './components/log_container';
import { TitleBar } from './components/title_bar';
import { MenuBar } from './components/menu_bar';
import { RuleContainer } from './components/rule_container';

class App extends React.Component<{}, {
    fileUrl: string,
    hint: string,
}> {
    constructor(props: {}) {
        super(props);
        this.state = { fileUrl: 'file directory', hint: '' };
        logManager.onSetHint = (hint: string) => this.setState({ hint });
        logManager.onSetFileUrl = (fileUrl: string) => this.setState({ fileUrl });
    }

    public render() {
        return <>
            <TitleBar />
            <MenuBar />
            <LogContainer />
            <RuleContainer />
            <div id='hintBar' className='systemInfo'><div>路径: {this.state.fileUrl}</div>{this.state.hint}</div></>;
    }
}

const root = createRoot(document.getElementById('app')!);
root.render(<App />);

