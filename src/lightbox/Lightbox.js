/* @flow strict-local */

import React, { useState, useCallback } from 'react';
import type { Node } from 'react';
import { View, Dimensions, LayoutAnimation } from 'react-native';
// $FlowFixMe[untyped-import]
import PhotoView from 'react-native-photo-view';
// $FlowFixMe[untyped-import]
import { useActionSheet } from '@expo/react-native-action-sheet';

import type { Message } from '../types';
import { useGlobalSelector, useSelector } from '../react-redux';
import type { ShowActionSheetWithOptions } from '../action-sheets';
import { getAuth, getGlobalSession } from '../selectors';
import { getResource } from '../utils/url';
import LightboxHeader from './LightboxHeader';
import LightboxFooter from './LightboxFooter';
import { constructActionSheetButtons, executeActionSheetAction } from './LightboxActionSheet';
import { createStyleSheet } from '../styles';
import { navigateBack } from '../actions';
import { streamNameOfStreamMessage } from '../utils/recipient';
import ZulipStatusBar from '../common/ZulipStatusBar';
import { useNavigation } from '../react-navigation';

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
  src: URL,
  message: Message,
|}>;

export default function Lightbox(props: Props): Node {
  const navigation = useNavigation();

  const [headerFooterVisible, setHeaderFooterVisible] = useState<boolean>(true);
  const showActionSheetWithOptions: ShowActionSheetWithOptions =
    useActionSheet().showActionSheetWithOptions;
  const auth = useSelector(getAuth);

  // Pulled out here just because this function is used twice.
  const handleImagePress = useCallback(() => {
    LayoutAnimation.configureNext({
      ...LayoutAnimation.Presets.easeInEaseOut,
      duration: 100, // from 300
    });
    setHeaderFooterVisible(m => !m);
  }, [setHeaderFooterVisible]);

  const { src, message } = props;
  const footerMessage =
    message.type === 'stream'
      ? `Shared in #${streamNameOfStreamMessage(message)}`
      : 'Shared with you';

  const resource = getResource(src, auth);

  // Since we're using `Dimensions.get` (below), we'll want a rerender
  // when the orientation changes. No need to store the value.
  useGlobalSelector(state => getGlobalSession(state).orientation);

  const { width: windowWidth, height: windowHeight } = Dimensions.get('window');

  return (
    <>
      <ZulipStatusBar hidden={!headerFooterVisible} backgroundColor="black" />
      <View style={styles.container}>
        <PhotoView
          source={resource}
          style={[styles.img, { width: windowWidth }]}
          // Doesn't seem to do anything on iOS:
          //   https://github.com/alwx/react-native-photo-view/issues/62
          //   https://github.com/alwx/react-native-photo-view/issues/98
          // TODO: Figure out how to make it work.
          resizeMode="contain"
          // Android already doesn't show any scrollbars; these two
          // iOS-only props let us hide them on iOS.
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          onTap={handleImagePress}
          onViewTap={handleImagePress}
        />
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
              navigation.dispatch(navigateBack());
            }}
            timestamp={message.timestamp}
            senderName={message.sender_full_name}
            senderId={message.sender_id}
          />
        </View>
        <View
          style={[
            styles.overlay,
            { width: windowWidth },
            headerFooterVisible ? { bottom: 0 } : { top: windowHeight },
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
    </>
  );
}
