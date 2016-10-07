import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableHighlight,
} from 'react-native';

const styles = StyleSheet.create({
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  colorBar: {
    width: 24,
    height: 24,
    margin: 8,
    borderRadius: 2,
  },
});

export default ({ customStyles, onPress, name, color = '#444' }) => (
  <TouchableHighlight onPress={onPress}>
    <View style={styles.row}>
      <View style={[styles.colorBar, { backgroundColor: color }]} />
      <Text style={customStyles}>
        {name}
      </Text>
    </View>
  </TouchableHighlight>
);
