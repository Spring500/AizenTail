import React from 'react';
import { createRoot } from 'react-dom/client';
import { logManager } from './managers/log_manager';
import { LogContainer } from './components/log_container';
import { TitleBar } from './components/title_bar';
import { MenuBar } from './components/menu_bar';
import { RulePanel } from './components/rule_panel/rule_panel';

class App extends React.Component<
    {},
    { fileUrl: string, hint: string, rulePanelVisible: boolean }> {
    constructor(props: {}) {
        super(props);
        this.state = { fileUrl: 'file directory', hint: '', rulePanelVisible: false };
        logManager.onSetHint = (hint: string) => this.setState({ hint });
        logManager.onSetFileUrl = (fileUrl: string) => this.setState({ fileUrl });
    }

    private onSwitchRulePanelVisible = () => this.setState({ rulePanelVisible: !this.state.rulePanelVisible });

    public render() {
        return <>
            <TitleBar />
            <MenuBar switchRulePanelVisible={this.onSwitchRulePanelVisible} rulePanelVisible={this.state.rulePanelVisible} />
            {
                this.state.rulePanelVisible
                    ? <><LogContainer manager={logManager} style={{ resize: 'vertical', maxHeight: 'calc(100% - 120px)', height: '50%' }} /><RulePanel /></>
                    : <><LogContainer manager={logManager} style={{ resize: 'none', height: 'auto', flex: '1 1 auto' }} /></>
            }
            <div id='hintBar' className='systemInfo'><div>路径: {this.state.fileUrl}</div>{this.state.hint}</div></>;
    }
}

const root = createRoot(document.getElementById('app')!);
root.render(<App />);

