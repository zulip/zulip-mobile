/* @flow strict-local */

import React, { useCallback, useContext } from 'react';
import type { Node } from 'react';
import { Alert, Platform, NativeModules } from 'react-native';

import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import { useGlobalSelector, useSelector } from '../react-redux';
import { getAuth, getSettings } from '../selectors';
import SwitchRow from '../common/SwitchRow';
import Screen from '../common/Screen';
import * as api from '../api';
import ServerPushSetupBanner from '../common/ServerPushSetupBanner';
import NestedNavRow from '../common/NestedNavRow';
import { useAppState } from '../reactNativeUtils';
import { IconAlertTriangle } from '../common/Icons';
import type { LocalizableText } from '../types';
import { TranslationContext } from '../boot/TranslationProvider';
import { kWarningColor } from '../styles/constants';
import { getIdentities, getIdentity, getIsActiveAccount } from '../account/accountsSelectors';
import { getRealm, getRealmName } from '../directSelectors';
import ZulipText from '../common/ZulipText';
import SettingsGroup from './SettingsGroup';
import { openSystemNotificationSettings } from '../utils/openLink';

const {
  Notifications, // android
  ZLPNotifications, // ios
} = NativeModules;

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'notifications'>,
  route: RouteProp<'notifications', void>,
|}>;

/**
 * A problem in the system notification settings that we should warn about.
 */
enum SystemSettingsWarning {
  Disabled = 0,
  // TODO: …more, e.g.:
  // TODO(#5484): Android notification sound file missing
  // TODO(#438): Badge count disabled (once iOS supports it)
}

function systemSettingsWarningMsg(warning: SystemSettingsWarning): LocalizableText {
  switch (warning) {
    case SystemSettingsWarning.Disabled:
      return 'Notifications are disabled.';
  }
}

/**
 * An array of the `SystemSettingsWarning`s that currently apply.
 */
const useSystemSettingsWarnings = (): $ReadOnlyArray<SystemSettingsWarning> => {
  const [disabled, setDisabled] = React.useState(false);

  // Subject to races if the native-method calls can resolve out of order
  // (unknown).
  const getAndSetDisabled = React.useCallback(async () => {
    setDisabled(
      Platform.OS === 'android'
        ? !(await Notifications.areNotificationsEnabled())
        : !(await ZLPNotifications.areNotificationsAuthorized()),
    );
  }, []);

  // Greg points out that neither iOS or Android seems to have an API for
  // subscribing to changes, so one has to poll, and this seems like a fine
  // way to do so:
  //   https://github.com/zulip/zulip-mobile/pull/5627#discussion_r1058055540
  const appState = useAppState();
  React.useEffect(() => {
    getAndSetDisabled();
  }, [getAndSetDisabled, appState]);

  const result = [];
  if (disabled) {
    result.push(SystemSettingsWarning.Disabled);
  }
  return result;
};

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
  const otherAccounts = useGlobalSelector(state =>
    getIdentities(state).filter(identity_ => !getIsActiveAccount(state, identity_)),
  );
  const realmName = useSelector(getRealmName);
  const pushNotificationsEnabled = useSelector(state => getRealm(state).pushNotificationsEnabled);
  const offlineNotification = useSelector(state => getSettings(state).offlineNotification);
  const onlineNotification = useSelector(state => getSettings(state).onlineNotification);
  const streamNotification = useSelector(state => getSettings(state).streamNotification);

  const systemSettingsWarnings = useSystemSettingsWarnings();

  const handleSystemSettingsPress = useCallback(() => {
    if (systemSettingsWarnings.length > 1) {
      Alert.alert(
        _('System settings for Zulip'),
        // List all warnings that apply.
        systemSettingsWarnings.map(w => _(systemSettingsWarningMsg(w))).join('\n\n'),
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
      {
        // TODO: Warn when device's push token isn't acked by the server.
      }
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
              return systemSettingsWarningMsg(systemSettingsWarnings[0]);
            default:
              return 'Multiple issues. Tap to learn more.';
          }
        })()}
        onPress={handleSystemSettingsPress}
      />
      {!systemSettingsWarnings.includes(SystemSettingsWarning.Disabled) && (
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
