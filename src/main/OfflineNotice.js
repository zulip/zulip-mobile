import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

const styles = StyleSheet.create({
  block: {
    padding: 8,
    backgroundColor: 'yellow',
  },
});

export default class OfflineNotice extends React.Component {
  render() {
    return (
      <View style={styles.block}>
        <Text>You are offline!</Text>
      </View>
    );
  }
}
