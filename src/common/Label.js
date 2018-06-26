/* @flow */
import React, { PureComponent } from 'react';
import { Text } from 'react-native';
import TranslatedText from './TranslatedText';

import type { Context, LocalizableText, Style } from '../types';

type Props = {
  text: LocalizableText,
  style?: Style,
};

/**
 * A component that on top of a standard Text component
 * provides seamless translation and ensures consistent
 * styling for the default and night themes.
 * Use `RawLabel` if you don't want the text translated.
 *
 * @prop text - Main component to be rendered.
 * @prop [style] - Style object applied to the Text component.
 */
export default class Label extends PureComponent<Props> {
  context: Context;
  props: Props;

  static contextTypes = {
    styles: () => null,
  };

  render() {
    const { styles } = this.context;
    const { text, style, ...restProps } = this.props;

    return (
      <Text style={[styles.label, style]} {...restProps}>
        <TranslatedText text={text} />
      </Text>
    );
  }
}
