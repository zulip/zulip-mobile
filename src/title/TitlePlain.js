/* @flow */
import React, { PureComponent } from 'react';
import { Text } from 'react-native';

import type { Context } from '../types';

type Props = {
  text: string,
  color: string,
};

export default class TitlePrivate extends PureComponent<Props> {
  context: Context;
  props: Props;

  static contextTypes = {
    styles: () => null,
  };

  render() {
    const { styles } = this.context;
    const { text, color } = this.props;
    return <Text style={[styles.navTitle, styles.flexed, { color }]}>{text}</Text>;
  }
}
