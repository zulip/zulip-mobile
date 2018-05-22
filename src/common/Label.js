/* @flow */
import React, { PureComponent } from 'react';
import { Text } from 'react-native';
import TranslatedText from './TranslatedText';

import type { Context, LocalizableText, Style } from '../types';

type Props = {
  text: LocalizableText,
  style?: Style,
};

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
