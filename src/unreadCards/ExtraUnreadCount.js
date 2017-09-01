/* @flow */
import React, { PureComponent } from 'react';
import { View, Text, StyleSheet } from 'react-native';

/*
 * Shows the number of messages left unread in a particular topic in the unread cards.
 * e.g. "+3 more unread messages".
*/

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

export default class ExtraUnreadCount extends PureComponent {
  props: {
    count: number,
  };

  render() {
    const { count } = this.props;

    return (
      <View style={styles.extraUnreadCount}>
        <Text style={styles.extraUnreadCountText}>
          +{count} more unread message
          {count > 1 && <Text>s</Text>}
        </Text>
      </View>
    );
  }
}
