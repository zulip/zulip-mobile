import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

import { Touchable } from '../common';
import { CONTROL_SIZE } from '../common/platform';
import Icon from '../common/Icons';

const styles = StyleSheet.create({
  row: {
    flex: 1,
    flexBasis: CONTROL_SIZE,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 24,
    height: 24,
    margin: 8,
    fontSize: 24,
    color: 'black',
    textAlign: 'center',
  },
});

export default ({ customStyles, onPress, name, icon }) => (
  <Touchable onPress={onPress}>
    <View style={styles.row}>
      <Icon style={styles.icon} name={icon} />
      <Text>{name}</Text>
    </View>
  </Touchable>
);
