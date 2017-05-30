import React from 'react';
import { Text } from 'react-native';

export default class Search extends React.Component {
  static navigationOptions = {
    tabBarLabel: '\uD83C\uDFC8',
  };
  render() {
    return (
      <Text>
        Activities emojies
      </Text>
    );
  }
}
