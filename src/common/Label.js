/* @flow */
import React, { PureComponent } from 'react';
import { Text } from 'react-native';
import TranslatedText from './TranslatedText';

import type { LocalizableText, Style } from '../types';

type Props = {
  text: LocalizableText,
  style?: Style,
};

export default class Label extends PureComponent<Props> {
  static contextTypes = {
    styles: () => null,
  };

  props: Props;

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
