/* @flow */
import React, { PureComponent } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import type { NavigationScreenProp } from 'react-navigation';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';

import { ZulipStatusBar } from '../common';
import LightboxContainer from './LightboxContainer';
import type { Message, ImageResource } from '../types';

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
    backgroundColor: 'black',
  },
});

type Props = {
  navigation: NavigationScreenProp<*> & {
    state: {
      params: {
        src: ImageResource,
        message: Message,
      },
    },
  },
};

export default class LightboxScreen extends PureComponent<Props> {
  props: Props;

  render() {
    const { src, message } = this.props.navigation.state.params;
    // Next I have checked if a normal image component renders with headers passed.
    // And this pattern works
    return (
        <View style={styles.screen}>
          <Image 
          style={{ height: 200, width: 233 }}
          source={{
              "uri": "https://hsinter0.zulipchat.com/user_uploads/2592/pBgI2pNHrCoY2P5d9ZFqf3Ps/art.jpg",
              "headers": {
                "Authorization": "Basic aGFyc2h1bHNoYXJtYTAwMEBnbWFpbC5jb206MjU0ZGNnaFl1Y3MyTG1vM0JJcHdYbDg5TzF1RlVGeEQ="
              }
            }} />
        </View>
    );
    return (
      <View style={styles.screen}>
        <ZulipStatusBar hidden backgroundColor="black" barStyle="light-content" />
        <ActionSheetProvider>
          <LightboxContainer src={src} message={message} />
        </ActionSheetProvider>
      </View>
    );
  }
}
