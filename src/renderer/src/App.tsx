import { logManager } from './managers/log_manager';
import { LogContainer } from './components/log_container';
import { TitleBar } from './components/title_bar';
import { MenuBar } from './components/menu_bar';
import { RulePanel } from './components/rule_panel/rule_panel';
import { useEffect, useState } from 'preact/hooks';
import { TSetting, ruleManager } from './managers/rule_manager';


export const App = function () {
    const [fileUrl, setFileUrl] = useState('file directory');
    const [hint, setHint] = useState('');
    const [rulePanelVisible, setRulePanelVisible] = useState(false);
    // TODO: 用state管理Rules，当Rules变化时，重新渲染RulePanel和LogContainer
    const [colorRules, setColorRules] = useState<ColorConfig[]>([]);
    const [replaceRules, setReplaceRules] = useState<ReplaceConfig[]>([]);
    const [filterRules, setFilterRules] = useState<FilterConfig[]>([]);
    const [ruleInited, setRuleInited] = useState(false);

    useEffect(() => {
        logManager.onSetHint = setHint;
        logManager.onSetFileUrl = setFileUrl;
        return () => {
            if (logManager.onSetHint == setHint)
                logManager.onSetHint = null;
            if (logManager.onSetFileUrl == setFileUrl)
                logManager.onSetFileUrl = null;
        }
    }, []);

    useEffect(() => {
        const onRuleChanged = (setting: TSetting) => {
            setColorRules([...setting.color]);
            setReplaceRules([...setting.replacing]);
            setFilterRules([...setting.filter]);
        };
        ruleManager.listen("ruleChanged", onRuleChanged);

        return () => {
            ruleManager.unlisten("ruleChanged", onRuleChanged);
        }
    }, []);

    useEffect(() => {
        ruleManager.saveConfig({ color: colorRules, replacing: replaceRules, filter: filterRules });
        console.log('save config', { color: colorRules, replacing: replaceRules, filter: filterRules });
    }, [colorRules, replaceRules, filterRules]);

    useEffect(() => {
        logManager.setFilterRules(filterRules);
    }, [filterRules]);

    // 当ruleInited为false时加载规则
    useEffect(() => {
        if (!ruleInited) {
            ruleManager.reloadSetting();
            setRuleInited(true);
        }
    }, [ruleInited]);

    const onSwitchRulePanelVisible = () => setRulePanelVisible(!rulePanelVisible);

    const OnChangeFile = async (file: File | null) => {
        if (!file) return;
        const filepath = file.path;
        await logManager.openFile(filepath);
    }
    const logContainerStyle = rulePanelVisible
        ? { resize: 'vertical', maxHeight: 'calc(100% - 120px)', height: '50%' }
        : { resize: 'none', height: 'auto', flex: '1 1 auto' };
    return <>
        <TitleBar />
        <MenuBar switchRulePanelVisible={onSwitchRulePanelVisible}
            rulePanelVisible={rulePanelVisible}
            loadRule={() => ruleManager.reloadSetting()}
            saveRule={(filepath: string) => ruleManager.saveFile(filepath, { color: colorRules, replacing: replaceRules, filter: filterRules })}
        />
        <LogContainer manager={logManager}
            style={logContainerStyle}
            onChangeFile={OnChangeFile}
            replaceRules={replaceRules}
            colorRules={colorRules}
        />
        {rulePanelVisible && <RulePanel
            replaceRules={replaceRules} setReplaceRules={setReplaceRules}
            colorRules={colorRules} setColorRules={setColorRules}
            filterRules={filterRules} setFilterRules={setFilterRules}
        />}
        <div id='hintBar' className='systemInfo'><div>路径: {fileUrl}</div>{hint}</div></>;
}
