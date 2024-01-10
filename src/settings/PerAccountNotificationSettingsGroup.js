/* @flow strict-local */

import React, { useCallback } from 'react';
import type { Node } from 'react';
import invariant from 'invariant';

import type { AppNavigationMethods } from '../nav/AppNavigator';
import { useDispatch, useGlobalSelector, useSelector } from '../react-redux';
import { getAuth, getSettings } from '../selectors';
import SwitchRow from '../common/SwitchRow';
import * as api from '../api';
import NavRow from '../common/NavRow';
import TextRow from '../common/TextRow';
import { IconAlertTriangle } from '../common/Icons';
import { kWarningColor } from '../styles/constants';
import {
  getIdentity,
  getSilenceServerPushSetupWarnings,
  getZulipFeatureLevel,
} from '../account/accountsSelectors';
import { getGlobalSession, getGlobalSettings, getRealm, getRealmName } from '../directSelectors';
import ZulipText from '../common/ZulipText';
import RowGroup from '../common/RowGroup';
import { openLinkWithUserPreference } from '../utils/openLink';
import {
  useNotificationReportsByIdentityKey,
  NotificationProblem,
  notifProblemShortReactText,
  chooseNotifProblemForShortText,
  pushNotificationsEnabledEndTimestampWarning,
  kPushNotificationsEnabledEndDoc,
} from './NotifTroubleshootingScreen';
import { keyOfIdentity } from '../account/accountMisc';
import { ApiError } from '../api/apiErrors';
import { showErrorAlert } from '../utils/info';
import * as logging from '../utils/logging';
import { TranslationContext } from '../boot/TranslationProvider';
import { setSilenceServerPushSetupWarnings } from '../account/accountActions';
import { useDateRefreshedAtInterval } from '../reactUtils';

type Props = $ReadOnly<{|
  navigation: AppNavigationMethods,
|}>;

/**
 * A RowGroup with per-account settings for NotificationsScreen.
 */
export default function PerAccountNotificationSettingsGroup(props: Props): Node {
  const { navigation } = props;

  const dispatch = useDispatch();
  const _ = React.useContext(TranslationContext);

  const dateNow = useDateRefreshedAtInterval(60_000);

  const auth = useSelector(getAuth);
  const identity = useSelector(getIdentity);
  const notificationReportsByIdentityKey = useNotificationReportsByIdentityKey();
  const notificationReport = notificationReportsByIdentityKey.get(keyOfIdentity(identity));
  invariant(
    notificationReport,
    'NotificationsScreen: expected notificationReport for current account',
  );
  const realmName = useSelector(getRealmName);
  const zulipFeatureLevel = useSelector(getZulipFeatureLevel);
  const pushNotificationsEnabled = useSelector(state => getRealm(state).pushNotificationsEnabled);
  const perAccountState = useSelector(state => state);
  const expiryWarning = pushNotificationsEnabledEndTimestampWarning(perAccountState, dateNow);
  const silenceServerPushSetupWarnings = useSelector(getSilenceServerPushSetupWarnings);
  const offlineNotification = useSelector(state => getSettings(state).offlineNotification);
  const onlineNotification = useSelector(state => getSettings(state).onlineNotification);
  const streamNotification = useSelector(state => getSettings(state).streamNotification);

  const globalSettings = useGlobalSelector(getGlobalSettings);

  const pushToken = useGlobalSelector(state => getGlobalSession(state).pushToken);

  const handleExpiryWarningPress = React.useCallback(() => {
    openLinkWithUserPreference(kPushNotificationsEnabledEndDoc, globalSettings);
  }, [globalSettings]);

  const handleSilenceWarningsChange = React.useCallback(() => {
    dispatch(setSilenceServerPushSetupWarnings(!silenceServerPushSetupWarnings));
  }, [dispatch, silenceServerPushSetupWarnings]);

  // Helper variable so that we can refer to the button correctly in
  // other UI text.
  const troubleshootingPageTitle = 'Troubleshooting';
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

  const [testNotificationRequestInProgress, setTestNotificationRequestInProgress] =
    React.useState(false);
  const handleTestNotificationPress = React.useCallback(async () => {
    invariant(pushToken != null, 'should be disabled if pushToken missing');
    setTestNotificationRequestInProgress(true);
    try {
      await api.sendTestNotification(auth, { token: pushToken });
    } catch (errorIllTyped) {
      const error: mixed = errorIllTyped; // https://github.com/facebook/flow/issues/2470

      if (!(error instanceof Error)) {
        logging.error('Unexpected non-error thrown from api.sendTestNotification');
        return;
      }

      let msg = undefined;
      if (error instanceof ApiError) {
        // TODO recognize error.code and try to fix? give better feedback?
        msg = _('The server said:\n\n{errorMessage}', { errorMessage: error.message });
      } else if (error.message.length > 0) {
        msg = error.message;
      }
      showErrorAlert(_('Failed to send test notification'), msg);
    } finally {
      setTestNotificationRequestInProgress(false);
    }
  }, [_, auth, pushToken]);

  let testNotificationDisabled = false;
  if (zulipFeatureLevel < 217) {
    testNotificationDisabled = {
      title: 'Feature not available',
      message: {
        text: 'This feature is only available for organizations on {zulipServerNameWithMinVersion}+.',
        values: { zulipServerNameWithMinVersion: 'Zulip Server 8.0' },
      },
      learnMoreButton: {
        url: new URL('https://zulip.readthedocs.io/en/stable/production/upgrade.html'),
        text: 'Upgrade instructions for server administrators',
      },
    };
  } else if (pushToken == null) {
    testNotificationDisabled = {
      title: 'Cannot send test notification',
      message: {
        text: 'Please tap “{troubleshootingPageTitle}” for more details.',
        values: { troubleshootingPageTitle: _(troubleshootingPageTitle) },
      },
    };
  } else if (testNotificationRequestInProgress) {
    testNotificationDisabled = {
      title: 'Request in progress',
      message: 'Please wait. A request is already in progress.',
    };
  }

  const children = [];
  if (expiryWarning != null) {
    children.push(
      <NavRow
        key="expiry"
        type="external"
        leftElement={{ type: 'icon', Component: IconAlertTriangle, color: kWarningColor }}
        title={expiryWarning.reactText}
        onPress={handleExpiryWarningPress}
      />,
    );
  }
  if (pushNotificationsEnabled) {
    children.push(
      <SwitchRow
        key="offlineNotification"
        label="Notifications when offline"
        value={offlineNotification}
        onValueChange={handleOfflineNotificationChange}
      />,
      <SwitchRow
        key="onlineNotification"
        label="Notifications when online"
        value={onlineNotification}
        onValueChange={handleOnlineNotificationChange}
      />,
      <SwitchRow
        key="streamNotification"
        label="Stream notifications"
        value={streamNotification}
        onValueChange={handleStreamNotificationChange}
      />,
      <NavRow
        key="troubleshooting"
        {...(() => {
          const problem = chooseNotifProblemForShortText({ report: notificationReport });
          return (
            problem != null && {
              leftElement: { type: 'icon', Component: IconAlertTriangle, color: kWarningColor },
              subtitle: notifProblemShortReactText(problem, realmName),
            }
          );
        })()}
        title={troubleshootingPageTitle}
        onPress={handleTroubleshootingPress}
      />,
      <TextRow
        key="test"
        title="Send a test notification"
        onPress={handleTestNotificationPress}
        disabled={testNotificationDisabled}
      />,
    );
  } else {
    children.push(
      <NavRow
        key="not-enabled"
        type="external"
        leftElement={{ type: 'icon', Component: IconAlertTriangle, color: kWarningColor }}
        title={notifProblemShortReactText(NotificationProblem.ServerHasNotEnabled, realmName)}
        onPress={() => {
          openLinkWithUserPreference(
            new URL(
              'https://zulip.com/help/mobile-notifications#enabling-push-notifications-for-self-hosted-servers',
            ),
            globalSettings,
          );
        }}
      />,
    );
  }

  children.push(
    <SwitchRow
      key="silence-warnings"
      label="Silence warnings about disabled mobile push notifications"
      value={silenceServerPushSetupWarnings}
      onValueChange={handleSilenceWarningsChange}
    />,
  );

  return (
    <RowGroup
      title={{
        text: 'Notification settings for this account ({email} in {realmName}):',
        values: {
          email: (
            <ZulipText
              inheritColor
              inheritFontSize
              style={{ fontWeight: 'bold' }}
              text={identity.email}
            />
          ),
          realmName: (
            <ZulipText
              inheritColor
              inheritFontSize
              style={{ fontWeight: 'bold' }}
              text={realmName}
            />
          ),
        },
      }}
    >
      {children}
    </RowGroup>
  );
}
