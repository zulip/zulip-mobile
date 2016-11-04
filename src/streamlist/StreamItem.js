import React from 'react';
import {
  StyleSheet,
  View,
  Text,
} from 'react-native';

import { Touchable } from '../common';

const styles = StyleSheet.create({
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    paddingLeft: 10,
    paddingRight: 10,
  },
});

export default ({ customStyles, onPress, name, icon }) => (
  <Touchable onPress={onPress}>
    <View style={styles.row}>
      {icon}
      <Text style={customStyles}>
        {name}
      </Text>
    </View>
  </Touchable>
);
