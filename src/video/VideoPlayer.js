/* @flow strict-local */

import React, { useState, useCallback } from 'react';
import { View, Dimensions, LayoutAnimation, Text } from 'react-native';
import { useActionSheet } from '@expo/react-native-action-sheet';

import Video from 'react-native-video';
import type { Message } from '../types';
import * as NavigationService from '../nav/NavigationService';
import type { ShowActionSheetWithOptions } from '../message/messageActionSheet';

import { useSelector } from '../react-redux';
import VideoPlayerHeader from './VideoPlayerHeader';
import VideoPlayerFooter from './VideoPlayerFooter';
import { constructActionSheetButtons, executeActionSheetAction } from './VideoPlayerActionSheet';
import { getAuth, getSession } from '../selectors';
import { getResource } from '../utils/url';
import { navigateBack } from '../actions';
import { createStyleSheet } from '../styles';
import { Touchable } from '../common';
import { streamNameOfStreamMessage } from '../utils/recipient';
import VideoPlayerIcone from './VideoPlayIcon';

const styles = createStyleSheet({
  video: {
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
  },
  textError: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  textErrorContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapper: {
    backgroundColor: 'gray',
    opacity: 0.8,
    borderRadius: 15,
    position: 'absolute',
  },
});

type Props = $ReadOnly<{|
  src: string,
  message: Message,
|}>;

export default function VideoPlayer(props: Props) {
  const { src, message } = props;

  const [headerFooterIconVisible, setHeaderFooterIconVisible] = useState<boolean>(true);
  const [videoError, setVideoError] = useState<boolean>(false);
  const [pauseVideo, setPauseVideo] = useState<boolean>(false);

  const showActionSheetWithOptions: ShowActionSheetWithOptions = useActionSheet()
    .showActionSheetWithOptions;

  const footerMessage =
    message.type === 'stream'
      ? `Shared in #${streamNameOfStreamMessage(message)}`
      : 'Shared with you';

  const { width: windowWidth, height: windowHeight } = Dimensions.get('window');

  const auth = useSelector(getAuth);

  const resource = getResource(src, auth);
  const videoUri = resource.uri;
  const videoHeaders = resource.headers;

  // Since we're using `Dimensions.get` (below), we'll want a rerender
  // when the orientation changes. No need to store the value.
  useSelector(state => getSession(state).orientation);

  const handleVideoPress = useCallback(() => {
    LayoutAnimation.configureNext({
      ...LayoutAnimation.Presets.easeInEaseOut,
      duration: 100, // from 300
    });
    setHeaderFooterIconVisible(m => !m);
  }, [setHeaderFooterIconVisible]);

  const onErrorHandler = err => {
    setVideoError(true);
  };
  const onEndHandler = () => {
    NavigationService.dispatch(navigateBack());
  };
  return (
    <View style={styles.container}>
      {videoError ? (
        <View style={styles.textErrorContainer}>
          <Text style={styles.textError}>Something wrong with this file!</Text>
        </View>
      ) : (
        <Touchable onPress={handleVideoPress} style={styles.video}>
          <Video
            source={{
              uri: videoUri,
              headers: { Authorization: videoHeaders ? videoHeaders.Authorization : null },
            }}
            rate={1}
            volume={1}
            paused={pauseVideo}
            resizeMode="cover"
            onError={onErrorHandler}
            onEnd={onEndHandler}
            style={styles.video}
          />
        </Touchable>
      )}
      <View style={[styles.iconWrapper, { top: windowHeight / 2 }, { left: windowWidth / 2 }]}>
        {headerFooterIconVisible ? (
          <VideoPlayerIcone
            onPressBack={() => {
              setPauseVideo(m => !m);
            }}
            name={pauseVideo ? 'play' : 'pause'}
          />
        ) : null}
      </View>
      <View
        style={[
          styles.overlay,
          styles.header,
          { width: windowWidth },
          headerFooterIconVisible ? { top: 0 } : { bottom: windowHeight },
        ]}
      >
        <VideoPlayerHeader
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
          headerFooterIconVisible ? { bottom: 0 } : { top: windowHeight },
        ]}
      >
        <VideoPlayerFooter
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
