import React from 'react';
import {
  StyleSheet,
  View,
  Text,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import { Touchable } from '../common';

const styles = StyleSheet.create({
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
  },
  icon: {
    width: 20,
    height: 20,
    margin: 5,
    fontSize: 20,
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
