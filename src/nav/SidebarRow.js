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
    alignItems: 'center',
    height: 40,
    paddingLeft: 10,
    paddingRight: 10,
  },
});

export default ({ customStyles, onPress, name, icon }) => (
  <TouchableHighlight onPress={onPress}>
    <View style={styles.row}>
      {icon}
      <Text style={customStyles}>
        {name}
      </Text>
    </View>
  </TouchableHighlight>
);
