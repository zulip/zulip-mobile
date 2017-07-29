/* @flow */
import React, { PureComponent } from 'react';
import { View, StyleSheet } from 'react-native';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';

import { ZulipStatusBar } from '../common';
import LightboxContainer from './LightboxContainer';
import { Message, ImageResource } from '../types';

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
    backgroundColor: 'black',
  },
});

export default class LightboxScreen extends PureComponent {
  props: {
    navigation: {
      state: {
        params: {
          src: ImageResource,
          message: Message,
        },
      },
    },
  };

  render() {
    const { src, message } = this.props.navigation.state.params;
    return (
      <View style={styles.screen}>
        <ZulipStatusBar hidden backgroundColor="black" />
        <ActionSheetProvider>
          <LightboxContainer src={src} message={message} />
        </ActionSheetProvider>
      </View>
    );
  }
}
