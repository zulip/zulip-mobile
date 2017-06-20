/* @flow */
import React from 'react';
import { View } from 'react-native';

import { Label, Touchable } from '../common';
import styles from '../styles';
import Icon from '../common/Icons';

type Props = {
  style: Object,
  onPress: () => void,
  name: string,
  icon: string,
}

export default ({ style, onPress, name, icon }: Props) => (
  <Touchable onPress={onPress}>
    <View style={styles.item}>
      <Icon style={styles.icon} name={icon} />
      <Label text={name} />
    </View>
  </Touchable>
);
