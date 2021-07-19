/* @flow strict-local */
import React, { PureComponent } from 'react';
import { Text } from 'react-native';

import styles from '../styles';

type Props = $ReadOnly<{|
  text: string,
  color: string,
|}>;

export default class TitlePlain extends PureComponent<Props> {
  render(): React$Node {
    const { text, color } = this.props;
    return <Text style={[styles.navTitle, styles.flexed, { color }]}>{text}</Text>;
  }
}
