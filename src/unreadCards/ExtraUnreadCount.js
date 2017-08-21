/* @flow */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  extraUnreadCount: {
    backgroundColor: '#FFFFFF',
    padding: 6,
    margin: 6,
  },
  extraUnreadCountText: {
    fontWeight: 'bold',
  },
});

export default ({ count }) =>
  <View style={styles.extraUnreadCount}>
    <Text style={styles.extraUnreadCountText}>
      +{count} more unread message
      {count > 1 && <Text>s</Text>}
    </Text>
  </View>;
