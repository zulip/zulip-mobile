/* @flow strict-local */

import React, { useState, useCallback } from 'react';
import { View, Dimensions } from 'react-native';
import PhotoView from 'react-native-photo-view';
import { useActionSheet } from '@expo/react-native-action-sheet';

import * as NavigationService from '../nav/NavigationService';
import type { Message } from '../types';
import { useSelector } from '../react-redux';
import type { ShowActionSheetWithOptions } from '../message/messageActionSheet';
import { getAuth, getSession } from '../selectors';
import { getResource } from '../utils/url';
import LightboxHeader from './LightboxHeader';
import LightboxFooter from './LightboxFooter';
import { constructActionSheetButtons, executeActionSheetAction } from './LightboxActionSheet';
import { createStyleSheet } from '../styles';
import { navigateBack } from '../actions';
import { streamNameOfStreamMessage } from '../utils/recipient';

const styles = createStyleSheet({
  img: {
    height: 300,
    flex: 1,
  },
  header: {},
  overlay: {
    backgroundColor: 'black',
    opacity: 0.8,
    position: 'absolute',
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

type Props = $ReadOnly<{|
  src: string,
  message: Message,
|}>;

export default function Lightbox(props: Props) {
  const [movement, setMovement] = useState<'in' | 'out'>('out');
  const showActionSheetWithOptions: ShowActionSheetWithOptions = useActionSheet()
    .showActionSheetWithOptions;
  const auth = useSelector(getAuth);

  // Pulled out here just because this function is used twice.
  const handleImagePress = useCallback(() => {
    setMovement(m => (m === 'out' ? 'in' : 'out'));
  }, [setMovement]);

  const { src, message } = props;
  const footerMessage =
    message.type === 'stream'
      ? `Shared in #${streamNameOfStreamMessage(message)}`
      : 'Shared with you';
  const resource = getResource(src, auth);

  // Since we're using `Dimensions.get` (below), we'll want a rerender
  // when the orientation changes. No need to store the value.
  useSelector(state => getSession(state).orientation);

  const { width: windowWidth, height: windowHeight } = Dimensions.get('window');

  return (
    <View style={styles.container}>
      <PhotoView
        source={resource}
        style={[styles.img, { width: windowWidth }]}
        resizeMode="contain"
        onTap={handleImagePress}
        onViewTap={handleImagePress}
      />
      <View
        style={[
          styles.overlay,
          styles.header,
          { width: windowWidth },
          movement === 'out' ? { top: 0 } : { bottom: windowHeight },
        ]}
      >
        <LightboxHeader
          onPressBack={() => {
            NavigationService.dispatch(navigateBack());
          }}
          timestamp={message.timestamp}
          avatarUrl={message.avatar_url}
          senderName={message.sender_full_name}
          senderEmail={message.sender_email}
        />
      </View>
      <View
        style={[
          styles.overlay,
          { width: windowWidth },
          movement === 'out' ? { bottom: 0 } : { top: windowHeight },
        ]}
      >
        <LightboxFooter
          displayMessage={footerMessage}
          onOptionsPress={() => {
            const options = constructActionSheetButtons();
            const cancelButtonIndex = options.length - 1;
            showActionSheetWithOptions(
              {
                options,
                cancelButtonIndex,
              },
              buttonIndex => {
                executeActionSheetAction({
                  title: options[buttonIndex],
                  src,
                  auth,
                });
              },
            );
          }}
        />
      </View>
    </View>
  );
}
