/* @flow strict-local */

import React, { useState, useCallback } from 'react';
import { View, Dimensions, Easing } from 'react-native';
import PhotoView from 'react-native-photo-view';
import { useActionSheet } from '@expo/react-native-action-sheet';

import * as NavigationService from '../nav/NavigationService';
import type { Message } from '../types';
import { useSelector } from '../react-redux';
import type { ShowActionSheetWithOptions } from '../message/messageActionSheet';
import { getAuth } from '../selectors';
import { getResource } from '../utils/url';
import { SlideAnimationView } from '../common';
import LightboxHeader from './LightboxHeader';
import LightboxFooter from './LightboxFooter';
import { constructActionSheetButtons, executeActionSheetAction } from './LightboxActionSheet';
import { NAVBAR_SIZE, createStyleSheet } from '../styles';
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
  const { width, height } = Dimensions.get('window');

  const animationProps = {
    easing: Easing.bezier(0.075, 0.82, 0.165, 1),
    duration: 300,
    movement,
  };

  return (
    <View style={styles.container}>
      <PhotoView
        source={resource}
        style={[styles.img, { width }]}
        resizeMode="contain"
        onTap={handleImagePress}
        onViewTap={handleImagePress}
      />
      <SlideAnimationView
        property="translateY"
        style={[styles.overlay, styles.header, { width }]}
        from={-NAVBAR_SIZE}
        to={0}
        {...animationProps}
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
      </SlideAnimationView>
      <SlideAnimationView
        property="translateY"
        style={[styles.overlay, { width, bottom: height - 44 }]}
        from={height}
        to={height - 44}
        {...animationProps}
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
      </SlideAnimationView>
    </View>
  );
}
