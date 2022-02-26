/* @flow strict-local */
import React, { useCallback } from 'react';
import type { Node } from 'react';
import { View } from 'react-native';

import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import * as NavigationService from '../nav/NavigationService';
import { useSelector } from '../react-redux';
import { delay } from '../utils/async';
import SwitchRow from '../common/SwitchRow';
import Screen from '../common/Screen';
import ZulipButton from '../common/ZulipButton';
import { getSettings } from '../directSelectors';
import { getAuth, getIsAdmin, getStreamForId } from '../selectors';
import StreamCard from './StreamCard';
import { IconPin, IconMute, IconNotifications, IconEdit, IconPlusSquare } from '../common/Icons';
import { navigateToEditStream, navigateToStreamSubscribers } from '../actions';
import styles from '../styles';
import { getSubscriptionsById } from '../subscriptions/subscriptionSelectors';
import * as api from '../api';
import getIsNotificationEnabled from './getIsNotificationEnabled';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'stream-settings'>,
  route: RouteProp<'stream-settings', {| streamId: number |}>,
|}>;

export default function StreamSettingsScreen(props: Props): Node {
  const auth = useSelector(getAuth);
  const isAdmin = useSelector(getIsAdmin);
  const stream = useSelector(state => getStreamForId(state, props.route.params.streamId));
  const subscription = useSelector(state =>
    getSubscriptionsById(state).get(props.route.params.streamId),
  );
  const userSettingStreamNotification = useSelector(state => getSettings(state).streamNotification);

  const handleTogglePinStream = useCallback(
    (newValue: boolean) => {
      api.setSubscriptionProperty(auth, stream.stream_id, 'pin_to_top', newValue);
    },
    [auth, stream],
  );

  const handleToggleMuteStream = useCallback(
    (newValue: boolean) => {
      api.setSubscriptionProperty(auth, stream.stream_id, 'is_muted', newValue);
    },
    [auth, stream],
  );

  const handlePressEdit = useCallback(() => {
    NavigationService.dispatch(navigateToEditStream(stream.stream_id));
  }, [stream]);

  const handlePressEditSubscribers = useCallback(() => {
    NavigationService.dispatch(navigateToStreamSubscribers(stream.stream_id));
  }, [stream]);

  const handlePressSubscribe = useCallback(() => {
    // This still uses a stream name (#3918) because the API method does; see there.
    api.subscriptionAdd(auth, [{ name: stream.name }]);
  }, [auth, stream]);

  const handlePressUnsubscribe = useCallback(() => {
    // This still uses a stream name (#3918) because the API method does; see there.
    api.subscriptionRemove(auth, [stream.name]);
  }, [auth, stream]);

  const handleToggleStreamPushNotification = useCallback(() => {
    const currentValue = getIsNotificationEnabled(subscription, userSettingStreamNotification);
    api.setSubscriptionProperty(auth, stream.stream_id, 'push_notifications', !currentValue);
  }, [auth, stream, subscription, userSettingStreamNotification]);

  return (
    <Screen title="Stream">
      <StreamCard stream={stream} subscription={subscription} />
      {subscription && (
        <>
          <SwitchRow
            Icon={IconPin}
            label="Pinned"
            value={subscription.pin_to_top}
            onValueChange={handleTogglePinStream}
          />
          <SwitchRow
            Icon={IconMute}
            label="Muted"
            value={subscription.in_home_view === false}
            onValueChange={handleToggleMuteStream}
          />
          <SwitchRow
            Icon={IconNotifications}
            label="Notifications"
            value={getIsNotificationEnabled(subscription, userSettingStreamNotification)}
            onValueChange={handleToggleStreamPushNotification}
          />
        </>
      )}
      <View style={styles.padding}>
        {isAdmin && (
          <ZulipButton
            style={styles.marginTop}
            Icon={IconEdit}
            text="Edit"
            secondary
            onPress={() => delay(handlePressEdit)}
          />
        )}
        <ZulipButton
          style={styles.marginTop}
          Icon={IconPlusSquare}
          text="Add subscribers"
          secondary
          onPress={() => delay(handlePressEditSubscribers)}
        />
        {subscription ? (
          <ZulipButton
            style={styles.marginTop}
            text="Unsubscribe"
            secondary
            onPress={() => delay(handlePressUnsubscribe)}
          />
        ) : (
          <ZulipButton
            style={styles.marginTop}
            text="Subscribe"
            secondary
            onPress={() => delay(handlePressSubscribe)}
          />
        )}
      </View>
    </Screen>
  );
}
