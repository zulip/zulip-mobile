/* @flow strict-local */
import React from 'react';
import type { Node } from 'react';
import { View } from 'react-native';

import type { Message } from '../types';
import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
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
  route: RouteProp<'lightbox', {| src: URL, message: Message |}>,
|}>;

export default function LightboxScreen(props: Props): Node {
  const { src, message } = props.route.params;

  return (
    <View style={styles.screen}>
      <Lightbox src={src} message={message} />
    </View>
  );
}
