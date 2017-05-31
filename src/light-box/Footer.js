import React from 'react';
import { Text, StyleSheet, View } from 'react-native';

import { humanDate, shortTime } from '../utils/date';

const styles = StyleSheet.create({
  container: {
    padding: 10,
    flexWrap: 'wrap',
  },
  text: {
    color: 'white',
  },
  fileName: {
    fontSize: 18,
  },
  timestamp: {
    fontSize: 14,
  },
  message: {
    fontSize: 14,
  },
  divider: {
    alignSelf: 'stretch',
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'white',
    marginTop: 5,
    marginBottom: 5,
  },
});

export default ({ fileName, timestamp, message, style }) => {
  const date = `${humanDate(new Date(timestamp * 1000))} ${shortTime(timestamp * 1000)}`;
  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.fileName, styles.text]} numberOfLines={2}>
        {fileName}
      </Text>
      <View style={styles.divider} />
      <Text style={[styles.timestamp, styles.text]}>
        {date}
      </Text>
      <Text style={[styles.message, styles.text]}>
        {message}
      </Text>
    </View>
  );
};
