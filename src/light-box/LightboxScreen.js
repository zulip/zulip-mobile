/* @flow */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';

import { ZulipStatusBar } from '../common';
import LightboxContainer from './LightboxContainer';

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
    backgroundColor: 'black',
  },
});

export default class LightboxScreen extends React.Component {
  render() {
    return (
      <View style={styles.screen}>
        <ZulipStatusBar hidden />
        <ActionSheetProvider>
          <LightboxContainer {...this.props} />
        </ActionSheetProvider>
      </View>
    );
  }
}
