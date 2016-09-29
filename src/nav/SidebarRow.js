import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableWithoutFeedback,
} from 'react-native';

const styles = StyleSheet.create({
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    overflow: 'hidden',
  },
});

export default ({ customStyles, onPress, name, color = '#444' }) => (
  <TouchableWithoutFeedback onPress={onPress}>
    <View style={styles.row}>
      <View style={[styles.colorBar, { backgroundColor: color }]} />
      <Text style={customStyles}>
        {name}
      </Text>
    </View>
  </TouchableWithoutFeedback>
);
