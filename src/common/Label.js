/* @flow strict-local */
import React, { PureComponent } from 'react';
import { Text } from 'react-native';
import TranslatedText from './TranslatedText';

import type { Context, LocalizableText } from '../types';

type Props = $ReadOnly<{|
  ...$Exact<$PropertyType<Text, 'props'>>,
  text: LocalizableText,
|}>;

/**
 * A component that on top of a standard Text component
 * provides seamless translation and ensures consistent
 * styling for the default and night themes.
 *
 * Use `RawLabel` if you don't want the text translated.
 *
 * @prop text - Translated before putting inside Text.
 * @prop [style] - Can override our default style for this component.
 * @prop ...all other Text props - Passed through verbatim to Text.
 *   See upstream: https://reactnative.dev/docs/text
 */
export default class Label extends PureComponent<Props> {
  context: Context;

  static contextTypes = {
    styles: () => null,
  };

  render() {
    const { styles: contextStyles } = this.context;
    const { text, style, ...restProps } = this.props;

    return (
      <Text style={[contextStyles.label, style]} {...restProps}>
        <TranslatedText text={text} />
      </Text>
    );
  }
}
