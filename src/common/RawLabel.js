/* @flow strict-local */
import React, { PureComponent } from 'react';
import { Text } from 'react-native';

import type { ThemeData } from '../styles';
import { ThemeContext } from '../styles';

type Props = $ReadOnly<{|
  ...$Exact<$PropertyType<Text, 'props'>>,
  text: string,
|}>;

/**
 * A component that on top of a standard Text component
 * ensures consistent styling for the default and night themes.
 *
 * Unlike `Label` it does not translate its contents.
 *
 * @prop text - Contents for Text.
 * @prop [style] - Can override our default style for this component.
 * @prop ...all other Text props - Passed through verbatim to Text.
 *   See upstream: https://reactnative.dev/docs/text
 */
export default class RawLabel extends PureComponent<Props> {
  static contextType = ThemeContext;
  context: ThemeData;

  styles = {
    label: {
      fontSize: 15,
    },
  };

  render() {
    const { text, style, ...restProps } = this.props;

    return (
      <Text style={[this.styles.label, { color: this.context.color }, style]} {...restProps}>
        {text}
      </Text>
    );
  }
}
