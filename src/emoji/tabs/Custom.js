import React from 'react';
import { Text } from 'react-native';

export default class Search extends React.Component {
  static navigationOptions = {
    tabBarLabel: '\uD83D\uDE3C',
  };
  render() {
    return (
      <Text>
        Custom realm
      </Text>
    );
  }
}
