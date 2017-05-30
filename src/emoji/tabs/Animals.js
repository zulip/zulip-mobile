import React from 'react';
import { Text } from 'react-native';

export default class Search extends React.Component {
  static navigationOptions = {
    tabBarLabel: '\uD83D\uDC2F',
  };
  render() {
    return (
      <Text>
        Animal emojies
      </Text>
    );
  }
}
