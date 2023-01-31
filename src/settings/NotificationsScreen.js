/* @flow strict-local */

import React, { useCallback, useContext } from 'react';
import type { Node } from 'react';
import { Alert } from 'react-native';
import invariant from 'invariant';

import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import { useGlobalSelector, useSelector } from '../react-redux';
import { getAuth, getSettings } from '../selectors';
import SwitchRow from '../common/SwitchRow';
import Screen from '../common/Screen';
import * as api from '../api';
import ServerPushSetupBanner from '../common/ServerPushSetupBanner';
import NestedNavRow from '../common/NestedNavRow';
import { IconAlertTriangle } from '../common/Icons';
import type { LocalizableText } from '../types';
import { TranslationContext } from '../boot/TranslationProvider';
import { kWarningColor } from '../styles/constants';
import { getIdentities, getIdentity, getIsActiveAccount } from '../account/accountsSelectors';
import { getRealm, getRealmName } from '../directSelectors';
import ZulipText from '../common/ZulipText';
import SettingsGroup from './SettingsGroup';
import { openSystemNotificationSettings } from '../utils/openLink';
import {
  useNotificationReportsByIdentityKey,
  NotificationProblem,
} from './NotifTroubleshootingScreen';
import { keyOfIdentity } from '../account/accountMisc';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'notifications'>,
  route: RouteProp<'notifications', void>,
|}>;

function systemSettingsWarning(problem): LocalizableText | null {
  switch (problem) {
    case NotificationProblem.SystemSettingsDisabled:
      return 'Notifications are disabled.';
    case NotificationProblem.GooglePlayServicesNotAvailable:
    case NotificationProblem.TokenNotAcked:
    case NotificationProblem.ServerHasNotEnabled:
      // We can't ask the user to fix this in system notification settings.
      return null;
  }
}

/**
 * Notification settings with warnings when something seems wrong.
 *
 * Includes an area for per-account settings.
 */
export default function NotificationsScreen(props: Props): Node {
  const { navigation } = props;

  const _ = useContext(TranslationContext);

  const auth = useSelector(getAuth);
  const identity = useSelector(getIdentity);
  const notificationReportsByIdentityKey = useNotificationReportsByIdentityKey();
  const notificationReport = notificationReportsByIdentityKey.get(keyOfIdentity(identity));
  invariant(
    notificationReport,
    'NotificationsScreen: expected notificationReport for current account',
  );
  const otherAccounts = useGlobalSelector(state =>
    getIdentities(state).filter(identity_ => !getIsActiveAccount(state, identity_)),
  );
  const realmName = useSelector(getRealmName);
  const pushNotificationsEnabled = useSelector(state => getRealm(state).pushNotificationsEnabled);
  const offlineNotification = useSelector(state => getSettings(state).offlineNotification);
  const onlineNotification = useSelector(state => getSettings(state).onlineNotification);
  const streamNotification = useSelector(state => getSettings(state).streamNotification);

  const systemSettingsWarnings = notificationReport.problems
    .map(systemSettingsWarning)
    .filter(Boolean);

  const handleSystemSettingsPress = useCallback(() => {
    if (systemSettingsWarnings.length > 1) {
      Alert.alert(
        _('System settings for Zulip'),
        // List all warnings that apply.
        systemSettingsWarnings.map(w => _(w)).join('\n\n'),
        [
          { text: _('Cancel'), style: 'cancel' },
          {
            text: _('Open settings'),
            onPress: () => {
              openSystemNotificationSettings();
            },
            style: 'default',
          },
        ],
        { cancelable: true },
      );
      return;
    }

    openSystemNotificationSettings();
  }, [systemSettingsWarnings, _]);

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

  const handleOtherAccountsPress = useCallback(() => {
    navigation.push('account-pick');
  }, [navigation]);

  return (
    <Screen title="Notifications">
      <ServerPushSetupBanner isDismissable={false} />
      <NestedNavRow
        icon={
          systemSettingsWarnings.length > 0
            ? {
                Component: IconAlertTriangle,
                color: kWarningColor,
              }
            : undefined
        }
        title="System settings for Zulip"
        subtitle={(() => {
          switch (systemSettingsWarnings.length) {
            case 0:
              return undefined;
            case 1:
              return systemSettingsWarnings[0];
            default:
              return 'Multiple issues. Tap to learn more.';
          }
        })()}
        onPress={handleSystemSettingsPress}
      />
      {!notificationReport.problems.includes(NotificationProblem.SystemSettingsDisabled) && (
        <>
          {pushNotificationsEnabled && (
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
              <NestedNavRow
                {...(() =>
                  notificationReport.problems.length > 0 && {
                    icon: { Component: IconAlertTriangle, color: kWarningColor },
                    subtitle: 'Notifications for this account may not arrive.',
                  })()}
                title="Troubleshooting"
                onPress={handleTroubleshootingPress}
              />
            </SettingsGroup>
          )}
          {otherAccounts.length > 0 && (
            <NestedNavRow title="Other accounts" onPress={handleOtherAccountsPress} />
          )}
        </>
      )}
    </Screen>
  );
}
