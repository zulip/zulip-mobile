/* @flow strict-local */

import React, { useCallback, useContext } from 'react';
import type { Node } from 'react';
import { Alert } from 'react-native';
import invariant from 'invariant';

import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import { useGlobalSelector, useSelector } from '../react-redux';
import Screen from '../common/Screen';
import ServerPushSetupBanner from '../common/ServerPushSetupBanner';
import NavRow from '../common/NavRow';
import { IconAlertTriangle } from '../common/Icons';
import type { LocalizableText } from '../types';
import { TranslationContext } from '../boot/TranslationProvider';
import { kWarningColor } from '../styles/constants';
import { getIdentities, getIdentity, getIsActiveAccount } from '../account/accountsSelectors';
import { getRealm } from '../directSelectors';
import { openSystemNotificationSettings } from '../utils/openLink';
import {
  useNotificationReportsByIdentityKey,
  NotificationProblem,
} from './NotifTroubleshootingScreen';
import { keyOfIdentity } from '../account/accountMisc';
import PerAccountNotificationSettingsGroup from './PerAccountNotificationSettingsGroup';

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
  const pushNotificationsEnabled = useSelector(state => getRealm(state).pushNotificationsEnabled);

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

  const handleOtherAccountsPress = useCallback(() => {
    navigation.push('account-pick');
  }, [navigation]);

  return (
    <Screen title="Notifications">
      <ServerPushSetupBanner isDismissable={false} />
      <NavRow
        leftElement={
          systemSettingsWarnings.length > 0
            ? {
                type: 'icon',
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
        type="external"
      />
      {!notificationReport.problems.includes(NotificationProblem.SystemSettingsDisabled) && (
        <>
          {pushNotificationsEnabled && (
            <PerAccountNotificationSettingsGroup navigation={navigation} />
          )}
          {otherAccounts.length > 0 && (
            <NavRow
              {...(() => {
                const problemAccountsCount = otherAccounts.filter(a => {
                  // eslint-disable-next-line no-underscore-dangle
                  const notificationReport_ = notificationReportsByIdentityKey.get(
                    keyOfIdentity(a),
                  );
                  invariant(notificationReport_, 'AccountPickScreen: expected notificationReport_');

                  return notificationReport_.problems.length > 0;
                }).length;
                return problemAccountsCount > 0
                  ? {
                      leftElement: {
                        type: 'icon',
                        Component: IconAlertTriangle,
                        color: kWarningColor,
                      },
                      subtitle: {
                        text: `\
{problemAccountsCount, plural,
  one {Notifications for {problemAccountsCount} other logged-in account may not arrive.}
  other {Notifications for {problemAccountsCount} other logged-in accounts may not arrive.}
}`,
                        values: { problemAccountsCount },
                      },
                    }
                  : undefined;
              })()}
              title="Other accounts"
              onPress={handleOtherAccountsPress}
            />
          )}
        </>
      )}
    </Screen>
  );
}
