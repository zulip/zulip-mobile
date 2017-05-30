import React from 'react';
import { Text } from 'react-native';

export default class RecentlyUsed extends React.Component {
  static navigationOptions = {
    tabBarLabel: '\uD83C\uDF5E',
  };
  render() {
    return (
      <Text>
      Food & drinks
      </Text>
    );
  }
}
