import React from 'react';
import { Text } from 'react-native';

export default class RecentlyUsed extends React.Component {
  static navigationOptions = {
    tabBarLabel: '\uD83D\uDE8C',
  };
  render() {
    return (
      <Text>
      Travel emojies
      </Text>
    );
  }
}
