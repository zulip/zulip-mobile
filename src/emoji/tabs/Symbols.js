import React from 'react';
import { Text } from 'react-native';

export default class Search extends React.Component {
  static navigationOptions = {
    tabBarLabel: '\u2764',
  };
  render() {
    return (
      <Text>
        Symbols
      </Text>
    );
  }
}
