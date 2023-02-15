/* @flow strict-local */

import React, { useCallback } from 'react';
import type { Node } from 'react';
import invariant from 'invariant';

import type { AppNavigationMethods } from '../nav/AppNavigator';
import { useSelector } from '../react-redux';
import { getAuth, getSettings } from '../selectors';
import SwitchRow from '../common/SwitchRow';
import * as api from '../api';
import NavRow from '../common/NavRow';
import { IconAlertTriangle } from '../common/Icons';
import { kWarningColor } from '../styles/constants';
import { getIdentity } from '../account/accountsSelectors';
import { getRealmName } from '../directSelectors';
import ZulipText from '../common/ZulipText';
import SettingsGroup from './SettingsGroup';
import { useNotificationReportsByIdentityKey } from './NotifTroubleshootingScreen';
import { keyOfIdentity } from '../account/accountMisc';

type Props = $ReadOnly<{|
  navigation: AppNavigationMethods,
|}>;

/**
 * A SettingsGroup with per-account settings for NotificationsScreen.
 */
export default function PerAccountNotificationSettingsGroup(props: Props): Node {
  const { navigation } = props;

  const auth = useSelector(getAuth);
  const identity = useSelector(getIdentity);
  const notificationReportsByIdentityKey = useNotificationReportsByIdentityKey();
  const notificationReport = notificationReportsByIdentityKey.get(keyOfIdentity(identity));
  invariant(
    notificationReport,
    'NotificationsScreen: expected notificationReport for current account',
  );
  const realmName = useSelector(getRealmName);
  const offlineNotification = useSelector(state => getSettings(state).offlineNotification);
  const onlineNotification = useSelector(state => getSettings(state).onlineNotification);
  const streamNotification = useSelector(state => getSettings(state).streamNotification);

  const handleTroubleshootingPress = useCallback(() => {
    navigation.push('notif-troubleshooting');
  }, [navigation]);

  // TODO(#3999): It'd be good to show "working on it" UI feedback while a
  //   request is pending, after the user touches a switch.

  const handleOfflineNotificationChange = useCallback(() => {
    api.toggleMobilePushSettings({
      auth,
      opp: 'offline_notification_change',
      value: !offlineNotification,
    });
  }, [offlineNotification, auth]);

  const handleOnlineNotificationChange = useCallback(() => {
    api.toggleMobilePushSettings({
      auth,
      opp: 'online_notification_change',
      value: !onlineNotification,
    });
  }, [onlineNotification, auth]);

  const handleStreamNotificationChange = useCallback(() => {
    api.toggleMobilePushSettings({
      auth,
      opp: 'stream_notification_change',
      value: !streamNotification,
    });
  }, [streamNotification, auth]);

  return (
    <SettingsGroup
      title={{
        text: 'Notification settings for this account ({email} in {realmName}):',
        values: {
          email: <ZulipText style={{ fontWeight: 'bold' }} text={identity.email} />,
          realmName: <ZulipText style={{ fontWeight: 'bold' }} text={realmName} />,
        },
      }}
    >
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
      <NavRow
        {...(() =>
          notificationReport.problems.length > 0 && {
            leftElement: {
              type: 'icon',
              Component: IconAlertTriangle,
              color: kWarningColor,
            },
            subtitle: 'Notifications for this account may not arrive.',
          })()}
        title="Troubleshooting"
        onPress={handleTroubleshootingPress}
      />
    </SettingsGroup>
  );
}
