/* @flow strict-local */
import React from 'react';
import { View } from 'react-native';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import type { Message } from '../types';
import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import { ZulipStatusBar } from '../common';
import { createStyleSheet } from '../styles';
import VideoPlayer from './VideoPlayer';

const styles = createStyleSheet({
  screen: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
    backgroundColor: 'black',
  },
});

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'video'>,
  route: RouteProp<'video', {| src: string, message: Message |}>,
|}>;

export default function VideoScreen(props: Props) {
  const { src, message } = props.route.params;
  return (
    <View style={styles.screen}>
      <ZulipStatusBar hidden backgroundColor="black" />
      <ActionSheetProvider>
        <VideoPlayer message={message} src={src} />
      </ActionSheetProvider>
    </View>
  );
}
