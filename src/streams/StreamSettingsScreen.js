/* @flow strict-local */
import React, { useCallback } from 'react';
import type { Node } from 'react';
import { View } from 'react-native';

import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import * as NavigationService from '../nav/NavigationService';
import { useDispatch, useSelector } from '../react-redux';
import { delay } from '../utils/async';
import { SwitchRow, Screen, ZulipButton } from '../common';
import { getSettings } from '../directSelectors';
import { getAuth, getIsAdmin, getStreamForId } from '../selectors';
import StreamCard from './StreamCard';
import { IconPin, IconMute, IconNotifications, IconEdit, IconPlusSquare } from '../common/Icons';
import {
  setSubscriptionProperty,
  navigateToEditStream,
  navigateToStreamSubscribers,
} from '../actions';
import styles from '../styles';
import { getSubscriptionsById } from '../subscriptions/subscriptionSelectors';
import * as api from '../api';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'stream-settings'>,
  route: RouteProp<'stream-settings', {| streamId: number |}>,
|}>;

export default function StreamSettingsScreen(props: Props): Node {
  const dispatch = useDispatch();

  const auth = useSelector(getAuth);
  const isAdmin = useSelector(getIsAdmin);
  const stream = useSelector(state => getStreamForId(state, props.route.params.streamId));
  const subscription = useSelector(state =>
    getSubscriptionsById(state).get(props.route.params.streamId),
  );
  const userSettingStreamNotification = useSelector(state => getSettings(state).streamNotification);

  const handleTogglePinStream = useCallback(
    (newValue: boolean) => {
      dispatch(setSubscriptionProperty(stream.stream_id, 'pin_to_top', newValue));
    },
    [dispatch, stream],
  );

  const handleToggleMuteStream = useCallback(
    (newValue: boolean) => {
      dispatch(setSubscriptionProperty(stream.stream_id, 'is_muted', newValue));
    },
    [dispatch, stream],
  );

  const handlePressEdit = useCallback(() => {
    NavigationService.dispatch(navigateToEditStream(stream.stream_id));
  }, [stream]);

  const handlePressEditSubscribers = useCallback(() => {
    NavigationService.dispatch(navigateToStreamSubscribers(stream.stream_id));
  }, [stream]);

  const handlePressSubscribe = useCallback(() => {
    api.subscriptionAdd(auth, [{ name: stream.name }]);
  }, [auth, stream]);

  const handlePressUnsubscribe = useCallback(() => {
    api.subscriptionRemove(auth, [stream.name]);
  }, [auth, stream]);

  const handleToggleStreamPushNotification = useCallback(() => {
    const currentValue = subscription?.push_notifications ?? userSettingStreamNotification;
    dispatch(setSubscriptionProperty(stream.stream_id, 'push_notifications', !currentValue));
  }, [dispatch, stream, subscription, userSettingStreamNotification]);

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
            value={subscription.push_notifications ?? userSettingStreamNotification}
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
