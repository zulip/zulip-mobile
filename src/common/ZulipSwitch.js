/* @flow */
import React, { PureComponent } from 'react';
import { Switch } from 'react-native';
import { BRAND_COLOR } from '../styles';

type Props = {
  value: boolean,
  disabled: boolean,
  defaultValue: boolean,
  onValueChange: (arg: boolean) => void,
};

type State = {
  valueControlled: boolean,
};

export default class ZulipSwitch extends PureComponent<Props, State> {
  props: Props;
  state: State;

  static defaultProps = {
    value: false,
    disabled: false,
    defaultValue: false,
  };

  state = {
    valueControlled: this.props.defaultValue,
  };

  handleValueChange = (newValue: boolean) => {
    const { onValueChange } = this.props;

    if (onValueChange) {
      onValueChange(newValue);
    }

    this.setState({
      valueControlled: newValue,
    });
  };

  render() {
    const { value, disabled } = this.props;
    const { valueControlled } = this.state;
    const switchValue = typeof valueControlled !== 'undefined' ? valueControlled : value;

    return (
      <Switch
        value={switchValue}
        onTintColor={BRAND_COLOR}
        tintColor="rgba(220, 220, 220, 1)"
        onValueChange={this.handleValueChange}
        disabled={disabled}
      />
    );
  }
}
