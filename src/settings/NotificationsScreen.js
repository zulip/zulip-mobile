/* @flow strict-local */

import React, { useCallback } from 'react';

import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import { useSelector, useDispatch } from '../react-redux';
import { getAuth, getSettings } from '../selectors';
import { SwitchRow, Screen } from '../common';
import * as api from '../api';
import { settingsChange } from '../actions';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'notifications'>,
  route: RouteProp<'notifications', void>,
|}>;

export default function NotificationsScreen(props: Props) {
  const auth = useSelector(getAuth);
  const offlineNotification = useSelector(state => getSettings(state).offlineNotification);
  const onlineNotification = useSelector(state => getSettings(state).onlineNotification);
  const streamNotification = useSelector(state => getSettings(state).streamNotification);
  const dispatch = useDispatch();

  const handleOfflineNotificationChange = useCallback(() => {
    api.toggleMobilePushSettings({
      auth,
      opp: 'offline_notification_change',
      value: !offlineNotification,
    });
    dispatch(settingsChange({ offlineNotification: !offlineNotification }));
  }, [offlineNotification, auth, dispatch]);

  const handleOnlineNotificationChange = useCallback(() => {
    api.toggleMobilePushSettings({
      auth,
      opp: 'online_notification_change',
      value: !onlineNotification,
    });
    dispatch(settingsChange({ onlineNotification: !onlineNotification }));
  }, [onlineNotification, auth, dispatch]);

  const handleStreamNotificationChange = useCallback(() => {
    api.toggleMobilePushSettings({
      auth,
      opp: 'stream_notification_change',
      value: !streamNotification,
    });
    dispatch(settingsChange({ streamNotification: !streamNotification }));
  }, [streamNotification, auth, dispatch]);

  return (
    <Screen title="Notifications">
      <SwitchRow
        label="Notifications when offline"
        value={offlineNotification}
        onValueChange={handleOfflineNotificationChange}
      />
      <SwitchRow
        label="Notifications when online"
        value={onlineNotification}
        onValueChange={handleOnlineNotificationChange}
      />
      <SwitchRow
        label="Stream notifications"
        value={streamNotification}
        onValueChange={handleStreamNotificationChange}
      />
    </Screen>
  );
}
