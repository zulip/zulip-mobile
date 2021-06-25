/* @flow strict-local */
import React from 'react';
import { View } from 'react-native';

import type { Message } from '../types';
import type { RouteProp } from '../react-navigation';
import type { MainStackNavigationProp } from '../nav/MainStackScreen';
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
  navigation: MainStackNavigationProp<'lightbox'>,
  route: RouteProp<'lightbox', {| src: string, message: Message |}>,
|}>;

export default function LightboxScreen(props: Props) {
  const { src, message } = props.route.params;

  return (
    <View style={styles.screen}>
      <Lightbox src={src} message={message} />
    </View>
  );
}
