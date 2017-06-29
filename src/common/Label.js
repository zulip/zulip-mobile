/* @flow */
import React, { PureComponent } from 'react';
import { Text } from 'react-native';
import { FormattedMessage } from 'react-intl';
import type { StyleObj } from 'react-native/Libraries/StyleSheet/StyleSheetTypes';

import { LocalizableText } from '../types';

export default class Label extends PureComponent {

  static contextTypes = {
    styles: () => null,
  };

  props: {
    text: LocalizableText,
    style?: StyleObj,
  };

  render() {
    const { text, style, ...restProps } = this.props;
    const message = text.text || text;

    return (
      <Text style={[this.context.styles.label, style]} {...restProps}>
        <FormattedMessage
          id={message}
          defaultMessage={message}
          values={text.values}
        />
      </Text>
    );
  }
}
