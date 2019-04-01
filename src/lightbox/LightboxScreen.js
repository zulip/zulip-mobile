/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View, StyleSheet } from 'react-native';
import type { NavigationScreenProp } from 'react-navigation';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';

import { ZulipStatusBar } from '../common';
import Lightbox from './Lightbox';
import type { Message } from '../types';

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
    backgroundColor: 'black',
  },
});

type Props = {|
  navigation: NavigationScreenProp<*> & {
    state: {
      params: {
        src: string,
        message: Message,
      },
    },
  },
|};

export default class LightboxScreen extends PureComponent<Props> {
  render() {
    const { navigation } = this.props;
    const src = navigation.getParam('src');
    const message = navigation.getParam('message');
    return (
      <View style={styles.screen}>
        <ZulipStatusBar hidden backgroundColor="black" />
        <ActionSheetProvider>
          <Lightbox src={src} message={message} />
        </ActionSheetProvider>
      </View>
    );
  }
}
