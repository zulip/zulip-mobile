/* @flow */
import React, { PureComponent } from 'react';

import { View, StyleSheet, Text } from 'react-native';
import { Screen } from '../common';
// import UnreadCardsContainer from './UnreadCardsContainer';

export default class UnreadCardsScreen extends PureComponent {
  render() {
    return(
      <Screen title="Unread Messages">
        <View>
          <Text> This is where unread cards will be visible </Text>
        </View>
      </Screen>
    );
  }
}