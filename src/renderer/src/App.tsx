import { logManager } from './managers/log_manager';
import { LogContainer } from './components/log_container';
import { TitleBar } from './components/title_bar';
import { MenuBar } from './components/menu_bar';
import { RulePanel } from './components/rule_panel/rule_panel';
import { useEffect, useState } from 'react';
import { TSetting, ruleManager } from './managers/rule_manager';


export const App = function () {
    const [fileUrl, setFileUrl] = useState('file directory');
    const [hint, setHint] = useState('');
    const [rulePanelVisible, setRulePanelVisible] = useState(false);
    const [colorRules, setColorRules] = useState<ColorConfig[]>([]);
    const [replaceRules, setReplaceRules] = useState<ReplaceConfig[]>([]);
    const [filterRules, setFilterRules] = useState<FilterConfig[]>([]);
    const [ruleInited, setRuleInited] = useState(false);
    const [isFiltering, setIsFiltering] = useState(false);
    const [isAutoScroll, setIsAutoScroll] = useState(true);
    const [isAlwaysOnTop, setIsAlwaysOnTop] = useState(false);

    const onKeyUp = (e: KeyboardEvent) => {
        switch (e.key) {
            case 'r':
                e.altKey && setIsAutoScroll(!isAutoScroll); return;
            case 'h':
                e.ctrlKey && setIsFiltering(!isFiltering); return;
            case 't':
                e.altKey && setIsAlwaysOnTop(!isAlwaysOnTop); return;
            case 'F12': window.electron.openDevTools(); return;
        }
    }
    useEffect(() => {
        logManager.onSetHint = setHint;
        document.onkeyup = onKeyUp;
        return () => {
            if (logManager.onSetHint == setHint) logManager.onSetHint = null;
            if (document.onkeyup == onKeyUp) document.onkeyup = null;
        }
    }, []);

    useEffect(() => {
        logManager.setFilterDisabled(!isFiltering);
    }, [isFiltering]);

    useEffect(() => {
        window.electron.setAlwaysOnTop(isAlwaysOnTop);
    }, [isAlwaysOnTop]);

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
        if (!ruleInited) return;
        ruleManager.saveConfig({ color: colorRules, replacing: replaceRules, filter: filterRules });
        console.log('save config', { color: colorRules, replacing: replaceRules, filter: filterRules });
    }, [colorRules, replaceRules, filterRules]);

    useEffect(() => {
        logManager.setFilterRules(filterRules);
    }, [filterRules]);

    // 当ruleInited为false时加载规则
    useEffect(() => {
        if (!ruleInited) {
            ruleManager.reloadConfig();
            setRuleInited(true);
        }
    }, [ruleInited]);

    const onSwitchRulePanelVisible = () => setRulePanelVisible(!rulePanelVisible);

    const OnChangeFile = async (file: File | null) => {
        if (!file) return;
        const filepath = file.path;
        await logManager.openFile(filepath);
    }
    const logContainerStyle: React.CSSProperties = rulePanelVisible
        ? { resize: 'vertical', maxHeight: 'calc(100% - 120px)', height: '50%' }
        : { resize: 'none', height: 'auto', flex: '1 1 auto' };
    return <>
        <TitleBar />
        <MenuBar switchRulePanelVisible={onSwitchRulePanelVisible}
            isFiltering={isFiltering} setIsFiltering={setIsFiltering}
            isAutoScroll={isAutoScroll} setIsAutoScroll={setIsAutoScroll}
            isAlwaysOnTop={isAlwaysOnTop} setIsAlwaysOnTop={setIsAlwaysOnTop}
            rulePanelVisible={rulePanelVisible}
            loadRule={() => ruleManager.reloadConfig()}
            saveRule={(filepath: string) => ruleManager.saveFile(filepath, { color: colorRules, replacing: replaceRules, filter: filterRules })}
            openLogFile={(filepath: string) => {
                logManager.openFile(filepath);
                setFileUrl(filepath);
            }}
        />
        <LogContainer manager={logManager}
            style={logContainerStyle}
            isFiltering={isFiltering}
            isAutoScroll={isAutoScroll}
            onChangeFile={OnChangeFile}
            replaceRules={replaceRules}
            colorRules={colorRules}
            filterRules={filterRules}
        />
        {rulePanelVisible && <RulePanel
            replaceRules={replaceRules} setReplaceRules={setReplaceRules}
            colorRules={colorRules} setColorRules={setColorRules}
            filterRules={filterRules} setFilterRules={setFilterRules}
        />}
        <div id='hintBar' className='systemInfo'><div>路径: {fileUrl}</div>{hint}</div></>;
}
