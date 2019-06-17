/* @flow strict-local */
import React, { PureComponent } from 'react';
import { Switch } from 'react-native';
import { BRAND_COLOR } from '../styles';

type Props = {|
  value: boolean,
  disabled: boolean,
  defaultValue: boolean,
  onValueChange: (arg: boolean) => void,
|};

type State = {|
  valueControlled: boolean,
|};

/**
 * An on/off component, provides consistent styling of the
 * built-in Switch component.
 *
 * @prop [value] - Value of the switch component.
 *   Setting this turns the component into a controlled one.
 * @prop [disabled] - If set the component is not switchable and visually looks disabled.
 * @prop [defaultValue] - Initial value of the switch.
 * @prop onValueChange - Event called on switch.
 */
export default class ZulipSwitch extends PureComponent<Props, State> {
  state = {
    valueControlled: this.props.defaultValue,
  };

  static defaultProps = {
    value: false,
    disabled: false,
    defaultValue: false,
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
        trackColor={{
          false: 'hsl(0, 0%, 86%)',
          true: BRAND_COLOR,
        }}
        onValueChange={this.handleValueChange}
        disabled={disabled}
      />
    );
  }
}
