import React from 'react';
import { Text } from 'react-native';

export default class RecentlyUsed extends React.Component {
  static navigationOptions = {
    tabBarLabel: '\uD83D\uDD50',
  };
  render() {
    return (
      <Text>
      Recently Used
      </Text>
    );
  }
}
