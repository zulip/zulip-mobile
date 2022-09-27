/* @flow strict-local */
import React from 'react';
import type { Node } from 'react';
import { Text } from 'react-native';

import styles from '../styles';

type Props = $ReadOnly<{|
  text: string,
  color: string,
|}>;

export default function TitlePlain(props: Props): Node {
  const { text, color } = props;
  return <Text style={[styles.navTitle, styles.flexed, { color }]}>{text}</Text>;
}
