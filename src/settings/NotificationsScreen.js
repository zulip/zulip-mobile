/* @flow strict-local */

import React, { useCallback } from 'react';

import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import type { Auth, Dispatch } from '../types';
import { connect } from '../react-redux';
import { getAuth, getSettings } from '../selectors';
import { OptionRow, Screen } from '../common';
import * as api from '../api';
import { settingsChange } from '../actions';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'notifications'>,
  route: RouteProp<'notifications', void>,

  auth: Auth,
  dispatch: Dispatch,
  offlineNotification: boolean,
  onlineNotification: boolean,
  streamNotification: boolean,
|}>;

function NotificationsScreen(props: Props) {
  const { auth, dispatch, offlineNotification, onlineNotification, streamNotification } = props;

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
      <OptionRow
        label="Notifications when offline"
        value={offlineNotification}
        onValueChange={handleOfflineNotificationChange}
      />
      <OptionRow
        label="Notifications when online"
        value={onlineNotification}
        onValueChange={handleOnlineNotificationChange}
      />
      <OptionRow
        label="Stream notifications"
        value={streamNotification}
        onValueChange={handleStreamNotificationChange}
      />
    </Screen>
  );
}

export default connect(state => ({
  auth: getAuth(state),
  offlineNotification: getSettings(state).offlineNotification,
  onlineNotification: getSettings(state).onlineNotification,
  streamNotification: getSettings(state).streamNotification,
}))(NotificationsScreen);
