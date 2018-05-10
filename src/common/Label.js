/* @flow */
import React, { PureComponent } from 'react';
import { Text } from 'react-native';
import { FormattedMessage } from 'react-intl';

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
    const { text, style, ...restProps } = this.props;
    const message = text.text || text;
    const { styles } = this.context;

    return (
      <Text style={[styles.label, style]} {...restProps}>
        <FormattedMessage id={message} defaultMessage={message} values={text.values} />
      </Text>
    );
  }
}
