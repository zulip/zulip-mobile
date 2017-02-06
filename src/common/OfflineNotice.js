import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

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
        <Icon
          style={styles.icon}
          size={20}
          color="black"
          name="warning"
        />
        <Text style={styles.text}>
          You are currently offline
        </Text>
      </View>
    );
  }
}
