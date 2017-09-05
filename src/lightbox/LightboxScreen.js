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

  state: {
    movement: string,
  };

  state = {
    movement: 'in',
  };

  handleImagePress = (movement: string) => {
    this.setState({ movement });
  }

  render() {
    const { src, message } = this.props.navigation.state.params;
    const { movement } = this.state;
    return (
      <View style={styles.screen}>
        <ZulipStatusBar hidden={movement === 'out'} fullScreen />
        <ActionSheetProvider>
          <LightboxContainer src={src} message={message} handleImagePress={this.handleImagePress} />
        </ActionSheetProvider>
      </View>
    );
  }
}
