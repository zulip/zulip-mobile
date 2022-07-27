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
  route: RouteProp<
    'lightbox',
    {|
      /**
       * The location of the image, for presentation in the lightbox.
       *
       * Must be a "valid URL string" as defined by the URL standard:
       *   https://url.spec.whatwg.org/#url-writing
       */
      src: string,

      message: Message,
    |},
  >,
|}>;

export default function LightboxScreen(props: Props): Node {
  const { src, message } = props.route.params;

  return (
    <View style={styles.screen}>
      <Lightbox src={src} message={message} />
    </View>
  );
}
