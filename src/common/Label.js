/* @flow */
import React, { PureComponent } from 'react';
import { Text } from 'react-native';
import { FormattedMessage } from 'react-intl';
import type { StyleObj } from 'react-native/Libraries/StyleSheet/StyleSheetTypes';

export default class Label extends PureComponent {

  static contextTypes = {
    styles: () => null,
  };

  props: {
    text: string,
    style?: StyleObj,
  };

  render() {
    const { text, style, ...restProps } = this.props;

    return (
      <Text style={[this.context.styles.label, style]} {...restProps}>
        <FormattedMessage id={text} defaultMessage={text} />
      </Text>
    );
  }
}
