import * as React from 'react';

export class TextField extends React.Component<{
    className?: string, value: string | undefined,
    placeholder?: string, style?: React.CSSProperties,
    list?: string | undefined,
    onChange: (value: string) => void, onEnter?: (value: string) => void,
}> {
    private onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.props.onChange(e.currentTarget.value);
    }

    private onKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
        e.key === "Enter" && e.currentTarget.blur();
    }

    private onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        this.props.onEnter && this.props.onEnter(e.currentTarget.value);
    }

    public render() {
        return <input className={this.props.className} type='text'
            value={this.props.value}
            placeholder={this.props.placeholder}
            style={this.props.style}
            list={this.props.list}
            onChange={this.onChange}
            onKeyUp={this.onKeyUp}
            onBlur={this.onBlur}
        />;
    }
}