import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { IconWarning } from '../common/Icons';

const styles = StyleSheet.create({
  block: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'yellow',
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default class OfflineNotice extends React.Component {
  render() {
    return (
      <View style={styles.block}>
        <IconWarning
          style={styles.icon}
          size={20}
          color="black"
        />
        <Text style={styles.text}>
          You are currently offline
        </Text>
      </View>
    );
  }
}
