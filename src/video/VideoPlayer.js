/* @flow strict-local */

import React, { useState, useCallback } from 'react';
import { View, Dimensions, LayoutAnimation, Text } from 'react-native';
import Video from 'react-native-video';
import type { Message } from '../types';
import * as NavigationService from '../nav/NavigationService';
import { useSelector } from '../react-redux';
import LightboxHeader from '../lightbox/LightboxHeader';
import { getAuth, getSession } from '../selectors';
import { getResource } from '../utils/url';
import { navigateBack } from '../actions';
import { createStyleSheet } from '../styles';
import { Touchable } from '../common';

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
});

type Props = $ReadOnly<{|
  src: string,
  message: Message,
|}>;

export default function VideoPlayer(props: Props) {
  const [headerFooterVisible, setHeaderFooterVisible] = useState<boolean>(true);
  const [videoError, setVideoError] = useState<boolean>(false);
  const auth = useSelector(getAuth);
  const { src, message } = props;

  const resource = getResource(src, auth);
  const videoUri = resource.uri;
  const videoHeaders = resource.headers;

  // Since we're using `Dimensions.get` (below), we'll want a rerender
  // when the orientation changes. No need to store the value.
  useSelector(state => getSession(state).orientation);

  const { width: windowWidth, height: windowHeight } = Dimensions.get('window');
  const onErrorHandle = err => {
    setVideoError(true);
  };

  const handleVideoPress = useCallback(() => {
    LayoutAnimation.configureNext({
      ...LayoutAnimation.Presets.easeInEaseOut,
      duration: 100, // from 300
    });
    setHeaderFooterVisible(m => !m);
  }, [setHeaderFooterVisible]);

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
            controls
            resizeMode="contain"
            onError={onErrorHandle}
            style={styles.video}
          />
        </Touchable>
      )}

      <View
        style={[
          styles.overlay,
          styles.header,
          { width: windowWidth },
          headerFooterVisible ? { top: 0 } : { bottom: windowHeight },
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
    </View>
  );
}
