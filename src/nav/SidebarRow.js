import React from 'react';
import {
  StyleSheet,
  View,
  Text,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import { Touchable } from '../common';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexBasis: 40,
    flexDirection: 'row',
    alignItems: 'center',
  },
  row: {
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
  <Touchable onPress={onPress} style={styles.container}>
    <View style={styles.row}>
      <Icon style={styles.icon} name={icon} />
      <Text>{name}</Text>
    </View>
  </Touchable>
);
