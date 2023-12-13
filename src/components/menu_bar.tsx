import React from 'react';
import { logManager } from '../managers/log_manager';

export class MenuBar extends React.Component<{}, {
    autoScroll: boolean,
    isFiltering: boolean,
    alwaysOnTop: boolean,
}> {
    constructor(props: {}) {
        super(props);
        this.state = { autoScroll: true, isFiltering: false, alwaysOnTop: false };
        logManager.onSetAutoScroll = (autoScroll) => this.setState({ autoScroll });
        logManager.onSetFiltering = (isFiltering) => this.setState({ isFiltering });
        logManager.onSetAlwaysOnTop = (alwaysOnTop) => this.setState({ alwaysOnTop });
    }

    private onClickOpenFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        file && await logManager.openFile(file)
    }
    private onInputFilter = (event: React.ChangeEvent<HTMLInputElement>) => logManager.setInputFilter(event.target.value);
    private onClickToggleAutoScroll = () => logManager.toggleAutoScroll();
    private onClickToggleFilter = () => logManager.toggleFilterSetting();
    private onClickToggleAlwaysOnTop = () => logManager.setAlwaysOnTop(!this.state.alwaysOnTop);

    public render() {
        return <><input type="file" id="openLogButton" onChange={this.onClickOpenFile} style={{ display: "none" }} />
            <div className='menuBar'>
                <button className='menuButton' title='打开日志文件' onClick={() => document.getElementById('openLogButton')?.click()}>打开文件</button>
                <button className='menuButton' title='切换是否当日志内容发生变化时自动滚动&#13;&#10;快捷键：Alt+R' onClick={this.onClickToggleAutoScroll}>{`滚动(R): ${this.state.autoScroll ? "开" : "关"}`}</button>
                <button className='menuButton' title='切换是否根据setting.config配置筛选日志&#13;&#10;快捷键：Alt+F' onClick={this.onClickToggleFilter}>{`筛选(F): ${this.state.isFiltering ? "开" : "关"}`}</button>
                <button className='menuButton' title='切换窗口置顶&#13;&#10;快捷键：Alt+T' onClick={this.onClickToggleAlwaysOnTop}>{`置顶(T): ${this.state.alwaysOnTop ? "开" : "关"}`}</button>
                <input type="text" className='menuFilter' placeholder='搜索日志' onChange={this.onInputFilter} />
            </div></>
    }
}
