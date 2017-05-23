/* @flow */
import React from 'react';
import { Text } from 'react-native';
import { FormattedMessage } from 'react-intl';

import styles from '../styles';

type FuncArguments = {
  text: string,
  style: string,
}

export default ({ text, style, ...restProps }: FuncArguments) => (
  <Text style={[styles.label, style]} {...restProps}>
    <FormattedMessage id={text} defaultMessage={text} />
  </Text>
);
