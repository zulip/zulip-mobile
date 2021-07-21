/* @flow strict-local */
import React from 'react';
import { Switch } from 'react-native';
// $FlowFixMe[untyped-import]
import Color from 'color';
import { BRAND_COLOR } from '../styles';

type Props = $ReadOnly<{|
  disabled?: boolean,
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
export default function ZulipSwitch(props: Props) {
  const { disabled = false, onValueChange, value } = props;
  return (
    <Switch
      value={value}
      trackColor={{
        false: 'hsl(0, 0%, 86%)',
        true: Color(BRAND_COLOR)
          .fade(0.3)
          .toString(),
      }}
      thumbColor={
        /* eslint-disable operator-linebreak */
        value
          ? // Material design would actually have this be a secondary
            // color, not a primary color. See "Thumb attributes" at
            // this doc:
            //   https://material.io/components/switches/android#anatomy-and-key-properties
            BRAND_COLOR
          : // Material design would have this be `colorSurface`
            // (see above-linked doc), which defaults to `#FFFFFF`,
            // at least in light mode; see
            //   https://material.io/develop/android/theming/color.
            '#FFFFFF'
      }
      onValueChange={onValueChange}
      disabled={disabled}
    />
  );
}
