import React from 'react';
import { Text } from 'react-native';

export default class Search extends React.Component {
  static navigationOptions = {
    tabBarLabel: '\uD83D\uDD0D',
  };
  render() {
    return (
      <Text>
        Search Screen
      </Text>
    );
  }
}
