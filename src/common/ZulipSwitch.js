/* @flow strict-local */
import React, { PureComponent } from 'react';
import { Switch } from 'react-native';
import { BRAND_COLOR } from '../styles';

type Props = $ReadOnly<{|
  disabled: boolean,
  value: boolean,
  onValueChange: (arg: boolean) => void,
|}>;

/**
 * An on/off component, provides consistent styling of the
 * built-in Switch component.
 *
 * @prop [disabled] - If set the component is not switchable and visually looks disabled.
 * @prop value - value of the switch.
 * @prop onValueChange - Event called on switch.
 */
export default class ZulipSwitch extends PureComponent<Props> {
  static defaultProps = {
    disabled: false,
  };

  render() {
    const { disabled, onValueChange, value } = this.props;

    return (
      <Switch
        value={value}
        trackColor={{
          false: 'hsl(0, 0%, 86%)',
          true: BRAND_COLOR,
        }}
        onValueChange={onValueChange}
        disabled={disabled}
      />
    );
  }
}
