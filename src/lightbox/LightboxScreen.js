/* @flow strict-local */
import React from 'react';
import { View } from 'react-native';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';

import { useSelector } from '../react-redux';
import { getSession } from '../selectors';
import type { Message } from '../types';
import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import { ZulipStatusBar } from '../common';
import { createStyleSheet } from '../styles';
import Lightbox from './Lightbox';

const styles = createStyleSheet({
  screen: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
    backgroundColor: 'black',
  },
});

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'lightbox'>,
  route: RouteProp<'lightbox', {| src: string, message: Message |}>,
|}>;

export default function LightboxScreen(props: Props) {
  const { src, message } = props.route.params;

  const orientation = useSelector(state => getSession(state).orientation);

  return (
    <View style={styles.screen}>
      {orientation === 'PORTRAIT' && (
        <View
          style={{
            height: 0,
            backgroundColor: 'black',
          }}
        />
      )}
      <ZulipStatusBar hidden backgroundColor="black" />
      <ActionSheetProvider>
        <Lightbox src={src} message={message} />
      </ActionSheetProvider>
    </View>
  );
}
