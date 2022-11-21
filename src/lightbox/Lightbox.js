/* @flow strict-local */

import React, { useState, useCallback } from 'react';
import type { Node } from 'react';
import { View, LayoutAnimation } from 'react-native';
// $FlowFixMe[untyped-import]
import PhotoView from 'react-native-photo-view';
// $FlowFixMe[untyped-import]
import { useActionSheet } from '@expo/react-native-action-sheet';

import type { Message } from '../types';
import { useSelector } from '../react-redux';
import type { ShowActionSheetWithOptions } from '../action-sheets';
import { getAuth } from '../selectors';
import { isUrlOnRealm } from '../utils/url';
import LightboxHeader from './LightboxHeader';
import LightboxFooter from './LightboxFooter';
import { constructActionSheetButtons, executeActionSheetAction } from './LightboxActionSheet';
import { createStyleSheet } from '../styles';
import { navigateBack } from '../actions';
import { streamNameOfStreamMessage } from '../utils/recipient';
import ZulipStatusBar from '../common/ZulipStatusBar';
import { useNavigation } from '../react-navigation';
import { getAuthHeaders } from '../api/transport';

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

  const styles = React.useMemo(
    () =>
      createStyleSheet({
        img: {
          height: 300,
          flex: 1,
        },
        header: {
          backgroundColor: 'black',
          opacity: 0.8,
          position: 'absolute',
          width: '100%',
          ...(headerFooterVisible ? { top: 0 } : { bottom: '100%' }),
        },
        footer: {
          backgroundColor: 'black',
          opacity: 0.8,
          position: 'absolute',
          width: '100%',
          ...(headerFooterVisible ? { bottom: 0 } : { top: '100%' }),
        },
        container: {
          flex: 1,
          justifyContent: 'space-between',
          alignItems: 'center',
        },
      }),
    [headerFooterVisible],
  );

  return (
    <>
      <ZulipStatusBar hidden={!headerFooterVisible} backgroundColor="black" />
      <View style={styles.container}>
        <PhotoView
          source={
            // Important: Don't include auth headers unless `src` is on the realm.
            isUrlOnRealm(src, auth.realm)
              ? { uri: src.toString(), headers: getAuthHeaders(auth) }
              : { uri: src.toString() }
          }
          style={[styles.img, { width: '100%' }]}
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
        <View style={styles.header}>
          <LightboxHeader
            onPressBack={() => {
              navigation.dispatch(navigateBack());
            }}
            timestamp={message.timestamp}
            senderName={message.sender_full_name}
            senderId={message.sender_id}
          />
        </View>
        <View style={styles.footer}>
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
