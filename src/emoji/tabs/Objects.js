import React from 'react';
import { Text } from 'react-native';

export default class RecentlyUsed extends React.Component {
  static navigationOptions = {
    tabBarLabel: '\uD83D\uDCA1',
  };
  render() {
    return (
      <Text>
      Objects emojies
      </Text>
    );
  }
}
