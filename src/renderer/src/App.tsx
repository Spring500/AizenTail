import { logManager } from './managers/log_manager';
import { LogContainer } from './components/log_container';
import { TitleBar } from './components/title_bar';
import { MenuBar } from './components/menu_bar';
import { RulePanel } from './components/rule_panel/rule_panel';
import { useState } from 'preact/hooks';

export const App = function () {
    const [fileUrl, setFileUrl] = useState('file directory');
    const [hint, setHint] = useState('');
    const [rulePanelVisible, setRulePanelVisible] = useState(false);
    logManager.onSetHint = setHint;
    logManager.onSetFileUrl = setFileUrl;

    const onSwitchRulePanelVisible = () => setRulePanelVisible(!rulePanelVisible);

    const OnChangeFile = async (file: File | null) => {
        if (!file) return;
        const filepath = file.path;
        await logManager.openFile(filepath);
    }

    return <>
        <TitleBar />
        <MenuBar switchRulePanelVisible={onSwitchRulePanelVisible} rulePanelVisible={rulePanelVisible} />
        {
            rulePanelVisible
                ? <><LogContainer manager={logManager} onChangeFile={OnChangeFile} style={{ resize: 'vertical', maxHeight: 'calc(100% - 120px)', height: '50%' }} /><RulePanel /></>
                : <><LogContainer manager={logManager} onChangeFile={OnChangeFile} style={{ resize: 'none', height: 'auto', flex: '1 1 auto' }} /></>
        }
        <div id='hintBar' className='systemInfo'><div>路径: {fileUrl}</div>{hint}</div></>;
}
