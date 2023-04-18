/* @flow strict-local */

import invariant from 'invariant';
import * as React from 'react';
import { Platform, ScrollView, NativeModules } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Clipboard from '@react-native-clipboard/clipboard';
import * as MailComposer from 'expo-mail-composer';
import { nativeApplicationVersion } from 'expo-application';
// $FlowFixMe[untyped-import]
import uniq from 'lodash.uniq';

import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import Screen from '../common/Screen';
import { createStyleSheet } from '../styles';
import { useGlobalSelector, useSelector } from '../react-redux';
import {
  getAccounts,
  getGlobalSession,
  getGlobalSettings,
  getRealm,
  getSession,
  getSettings,
} from '../directSelectors';
import {
  getAccount,
  getServerVersion,
  getZulipFeatureLevel,
  tryGetActiveAccountState,
} from '../account/accountsSelectors';
import { showToast } from '../utils/info';
import Input from '../common/Input';
import ZulipButton from '../common/ZulipButton';
import { identityOfAccount, keyOfIdentity } from '../account/accountMisc';
import AlertItem from '../common/AlertItem';
import ZulipText from '../common/ZulipText';
import type { Identity } from '../types';
import type { SubsetProperties } from '../generics';
import type { ZulipVersion } from '../utils/zulipVersion';
import { useAppState } from '../reactNativeUtils';
import * as logging from '../utils/logging';
import { getHaveServerData } from '../haveServerDataSelectors';
import { TranslationContext } from '../boot/TranslationProvider';
import isAppOwnDomain from '../isAppOwnDomain';
import { openLinkWithUserPreference, openSystemNotificationSettings } from '../utils/openLink';
import { getOwnUserRole, roleIsAtLeast } from '../permissionSelectors';
import { Role } from '../api/permissionsTypes';

const {
  Notifications, // android
  ZLPNotificationsStatus, // ios
} = NativeModules;

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'notif-troubleshooting'>,
  route: RouteProp<'notif-troubleshooting', void>,
|}>;

// Keep in sync with Android Notifications.googlePlayServicesAvailability.
type GooglePlayServicesAvailability = {|
  +errorCode: number,
  +errorMessage: string | null, // observed to be null when there was no error
  +hasResolution: boolean,
  +isSuccess: boolean,
|};

/**
 * Information about system settings, Google services availability, etc.
 *
 * A property will be null when we expect a value but don't have it yet.
 * It'll be undefined if we don't expect a value from the platform. (This
 * way, it's naturally removed from the JSON report we give the user.)
 */
type NativeState = {|
  +systemSettingsEnabled: boolean | null,
  +googlePlayServicesAvailability: GooglePlayServicesAvailability | null | void,

  // TODO: …more, e.g.:
  // TODO(#5484): Android notification sound file missing
  // TODO(#438): Badge count disabled (once iOS supports it)
|};

function useNativeState() {
  const [result, setResult] = React.useState<NativeState>({
    systemSettingsEnabled: null,
    googlePlayServicesAvailability: Platform.OS === 'android' ? null : undefined,
  });

  // Subject to races if calls to a given native method can resolve out of
  // order (unknown).
  const getAndSetResult = React.useCallback(() => {
    (async () => {
      const systemSettingsEnabled: boolean = await (Platform.OS === 'android'
        ? Notifications.areNotificationsEnabled()
        : ZLPNotificationsStatus.areNotificationsAuthorized());
      setResult(r => ({ ...r, systemSettingsEnabled }));
    })();

    if (Platform.OS === 'android') {
      (async () => {
        const googlePlayServicesAvailability: GooglePlayServicesAvailability =
          await Notifications.googlePlayServicesAvailability();
        setResult(r => ({ ...r, googlePlayServicesAvailability }));
      })();
    }
  }, []);

  // Greg points out that neither iOS or Android seems to have an API for
  // subscribing to changes, so one has to poll, and this seems like a fine
  // way to do so:
  //   https://github.com/zulip/zulip-mobile/pull/5627#discussion_r1058055540
  const appState = useAppState();
  React.useEffect(() => {
    getAndSetResult();
  }, [getAndSetResult, appState]);

  return result;
}

/**
 * Something that's very likely to prevent notifications from working.
 */
export enum NotificationProblem {
  TokenNotAcked = 0,
  SystemSettingsDisabled = 1,
  GooglePlayServicesNotAvailable = 2,
  ServerHasNotEnabled = 3,

  // TODO: more, such as:
  //   - Can't reach the server (ideally after #5615, to be less buggy)
  //   - Android notification sound file missing (#5484)
}

/**
 * Data relevant to an account's push notifications, for support requests.
 *
 * Use jsonifyNotificationReport to get this into the form we want the user
 * to send the data in. One thing that does is strip away properties with
 * value `undefined`.
 */
export type NotificationReport = {|
  ...Identity,
  +isSelfHosted: boolean,
  +platform: SubsetProperties<typeof Platform, {| +OS: mixed, +Version: mixed, +isPad: boolean |}>,
  +nativeApplicationVersion: string | null,
  +nativeState: NativeState,
  +problems: $ReadOnlyArray<NotificationProblem>,
  +isLoggedIn: boolean,
  +devicePushToken: string | null,
  +ackedPushToken: string | null,

  /**
   * See PerAccountSessionState.registerPushTokenRequestsInProgress.
   *
   * Pre-#5006, this will be undefined except for the active account if any.
   */
  // TODO(#5006): When we maintain this for all accounts, include it for all.
  +registerPushTokenRequestsInProgress: number | void,

  /**
   * Server data from an event queue, if any.
   *
   * Pre-#5006, this will be undefined except for the active, logged-in
   * account, if it exists. For an active account that doesn't have server
   * data yet, will be null.
   */
  // TODO(#5006): When we store server data for multiple accounts, include
  //   this for all accounts that have server data.
  +serverData: {|
    +zulipVersion: ZulipVersion,
    +zulipFeatureLevel: number,
    +pushNotificationsEnabled: boolean,
    +offlineNotification: boolean,
    +onlineNotification: boolean,
    +streamNotification: boolean,
  |} | null | void,
|};

/**
 * Put a NotificationReport into the form we'd like to receive the data in.
 */
function jsonifyNotificationReport(report: NotificationReport): string {
  return JSON.stringify(
    { ...report, problems: report.problems.map(p => NotificationProblem.getName(p)) },
    null,
    2,
  );
}

/**
 * Generate and return a NotificationReport for all accounts we know about.
 */
export function useNotificationReportsByIdentityKey(): Map<string, NotificationReport> {
  const platform = React.useMemo(
    () => ({ OS: Platform.OS, Version: Platform.Version, isPad: Platform.isPad }),
    [],
  );
  const nativeState = useNativeState();
  const pushToken = useGlobalSelector(state => getGlobalSession(state).pushToken);
  const accounts = useGlobalSelector(getAccounts);
  const activeAccountState = useGlobalSelector(tryGetActiveAccountState);

  return React.useMemo(
    () =>
      new Map(
        accounts.map(account => {
          const { ackedPushToken, apiKey } = account;
          const identity = identityOfAccount(account);
          const isLoggedIn = apiKey !== '';

          let registerPushTokenRequestsInProgress = undefined;
          let serverData = undefined;
          if (
            activeAccountState
            && keyOfIdentity(identityOfAccount(getAccount(activeAccountState)))
              === keyOfIdentity(identityOfAccount(account))
          ) {
            registerPushTokenRequestsInProgress =
              getSession(activeAccountState).registerPushTokenRequestsInProgress;
            serverData = getHaveServerData(activeAccountState)
              ? {
                  zulipVersion: getServerVersion(activeAccountState),
                  zulipFeatureLevel: getZulipFeatureLevel(activeAccountState),
                  pushNotificationsEnabled: getRealm(activeAccountState).pushNotificationsEnabled,
                  offlineNotification: getSettings(activeAccountState).offlineNotification,
                  onlineNotification: getSettings(activeAccountState).onlineNotification,
                  streamNotification: getSettings(activeAccountState).streamNotification,
                }
              : null;
          }

          const problems = [];
          if (isLoggedIn) {
            if (
              nativeState.googlePlayServicesAvailability
              && !nativeState.googlePlayServicesAvailability.isSuccess
            ) {
              problems.push(NotificationProblem.GooglePlayServicesNotAvailable);
            }
            if (nativeState.systemSettingsEnabled === false) {
              problems.push(NotificationProblem.SystemSettingsDisabled);
            }
            if (serverData && !serverData.pushNotificationsEnabled) {
              problems.push(NotificationProblem.ServerHasNotEnabled);
            }
            if (ackedPushToken == null || pushToken !== ackedPushToken) {
              problems.push(NotificationProblem.TokenNotAcked);
            }
          }

          return [
            keyOfIdentity(identityOfAccount(account)),
            {
              ...identity,
              isSelfHosted: !isAppOwnDomain(identity.realm),
              platform,
              nativeApplicationVersion,
              nativeState,
              problems,
              isLoggedIn,
              devicePushToken: pushToken,
              ackedPushToken,
              registerPushTokenRequestsInProgress,
              serverData,
            },
          ];
        }),
      ),
    [nativeState, accounts, activeAccountState, pushToken, platform],
  );
}

/**
 * MailComposer.isAvailableAsync(), with polling on appState changes.
 */
function useMailComposerIsAvailable(): boolean | null {
  const [result, setResult] = React.useState(null);

  const getAndSetResult = React.useCallback(async () => {
    setResult(await MailComposer.isAvailableAsync());
  }, []);

  const appState = useAppState();
  React.useEffect(() => {
    getAndSetResult();
  }, [getAndSetResult, appState]);

  return result;
}

/**
 * A per-account screen for troubleshooting notifications.
 *
 * Shows an alert (or alerts) when we know something is wrong, giving a
 * diagnosis and fix when we can, and otherwise asking the user to contact
 * support.
 *
 * Offers data (in JSON) that we can use in support requests and bug
 * reports. The user can tap a copy-to-clipboard button or open an email
 * composing session in their platform's native mail app.
 */
export default function NotifTroubleshootingScreen(props: Props): React.Node {
  const _ = React.useContext(TranslationContext);

  const settings = useGlobalSelector(getGlobalSettings);

  const account = useSelector(getAccount);
  const identity = identityOfAccount(account);
  const isAtLeastAdmin = useSelector(state => roleIsAtLeast(getOwnUserRole(state), Role.Admin));

  const notificationReportsByIdentityKey = useNotificationReportsByIdentityKey();
  const report = notificationReportsByIdentityKey.get(keyOfIdentity(identityOfAccount(account)));
  invariant(report, 'NotifTroubleshootingScreen: expected report');

  const styles = React.useMemo(
    () =>
      createStyleSheet({
        contentArea: {
          flex: 1,
        },
        button: {
          marginBottom: 8,
        },
        emailText: {
          fontWeight: 'bold',
        },
        reportTextInput: {
          flex: 1,
          fontFamily:
            Platform.OS === 'ios'
              ? 'Courier' // This doesn't seem to work on Android
              : 'monospace', // This doesn't seem to work on iOS
        },
      }),
    [],
  );

  const reportJson = React.useMemo(() => jsonifyNotificationReport(report), [report]);

  const handlePressCopy = React.useCallback(() => {
    Clipboard.setString(reportJson);
    showToast(_('Copied'));
  }, [reportJson, _]);

  const mailComposerIsAvailable = useMailComposerIsAvailable();

  const handlePressEmailSupport = React.useCallback(async () => {
    const result = await MailComposer.composeAsync({
      recipients: ['support@zulip.com'],
      subject: 'Zulip push notifications',
      body: `\
<h3>The problem:</h3>
<p>(${_('Please describe the problem.')})</p>
<h3>Other details:</h3>
<p>(${_('If there are other details you would like to share, please write them here.')})</p>
<hr>
<p>This email was written from a template provided by the Zulip mobile app.</p>
<details>
  <summary>Technical details:</summary>
  <pre>${reportJson}</pre>
</details>\
`,
      isHtml: true,
    });

    switch (result.status) {
      case MailComposer.MailComposerStatus.CANCELLED:
        break;
      case MailComposer.MailComposerStatus.SAVED:
        showToast(_('Draft saved'));
        break;
      case MailComposer.MailComposerStatus.SENT:
        showToast(_('Email sent'));
        logging.info('NotifTroubleshootingScreen: MailComposer reports a sent email.');
        break;
      case MailComposer.MailComposerStatus.UNDETERMINED:
        logging.warn('MailComposerStatus.UNDETERMINED');
        break;
    }
  }, [reportJson, _]);

  // Generic "contact support" alert for any/all problems that the user
  // can't resolve themselves. If multiple problems map to this alert, we
  // deduplicate the alert.
  const genericAlert = (
    <AlertItem
      bottomMargin
      text={{
        text: 'Notifications for this account may not arrive. Please contact {supportEmail} with the details below.',
        values: {
          supportEmail: (
            <ZulipText
              inheritColor
              inheritFontSize
              style={styles.emailText}
              text="support@zulip.com"
            />
          ),
        },
      }}
    />
  );
  const alerts = [];
  report.problems.forEach(problem => {
    switch (problem) {
      case NotificationProblem.SystemSettingsDisabled:
        alerts.push(
          <AlertItem
            buttons={[
              { id: 'fix', label: 'Open settings', onPress: openSystemNotificationSettings },
            ]}
            bottomMargin
            text="Notifications are disabled in system settings."
          />,
        );
        break;

      case NotificationProblem.GooglePlayServicesNotAvailable:
        // TODO: Could offer as a solution in case the user is actually fine
        //   with Google Play Services and just has a problem with its setup:
        //   - It looks like you can ask Android to run a native flow to
        //     fix problems with Google Play Services:
        //       https://developers.google.com/android/reference/com/google/android/gms/common/GoogleApiAvailability
        alerts.push(
          <AlertItem
            bottomMargin
            text="Notifications require Google Play Services, which is unavailable on this device."
          />,
        );
        break;

      case NotificationProblem.ServerHasNotEnabled:
        alerts.push(
          <AlertItem
            bottomMargin
            text={
              isAtLeastAdmin
                ? {
                    text: 'The Zulip server at {realm} is not set up to deliver push notifications. Please contact your administrator.',
                    values: { realm: identity.realm.toString() },
                  }
                : {
                    text: 'The Zulip server at {realm} is not set up to deliver push notifications.',
                    values: { realm: identity.realm.toString() },
                  }
            }
            buttons={[
              {
                id: 'learn-more',
                label: 'Learn more',
                onPress: () => {
                  openLinkWithUserPreference(
                    new URL(
                      'https://zulip.readthedocs.io/en/stable/production/mobile-push-notifications.html',
                    ),
                    settings,
                  );
                },
              },
            ]}
          />,
        );
        break;

      case NotificationProblem.TokenNotAcked: {
        // TODO: Could offer:
        //   - Re-request the device token from the platform (#5329 may be
        //     an obstacle), and show if a/the request hasn't completed
        //   - Re-request registering token with server, and show if a/the
        //     request hasn't completed
        alerts.push(genericAlert);
      }
    }
  });

  return (
    <Screen scrollEnabled={false} title="Troubleshooting" padding>
      <SafeAreaView mode="padding" edges={['right', 'left']} style={styles.contentArea}>
        {
          // TODO: Avoid comparing these complex UI-describing objects:
          //   https://github.com/zulip/zulip-mobile/pull/5654#discussion_r1105122407
          uniq(alerts) // Deduplicate genericAlert, which multiple problems might map to
        }
        {mailComposerIsAvailable === true && (
          <ZulipButton
            style={styles.button}
            text={{
              text: 'Email {supportEmail}',
              values: {
                supportEmail: (
                  <ZulipText
                    inheritColor
                    inheritFontSize
                    style={styles.emailText}
                    text="support@zulip.com"
                  />
                ),
              },
            }}
            onPress={handlePressEmailSupport}
          />
        )}
        <ZulipButton style={styles.button} text="Copy to clipboard" onPress={handlePressCopy} />
        {Platform.OS === 'android' ? (
          // ScrollView for Android-only symptoms like
          // facebook/react-native#23117
          <ScrollView style={{ flex: 1 }}>
            <Input editable={false} multiline style={styles.reportTextInput} value={reportJson} />
          </ScrollView>
        ) : (
          <Input editable={false} multiline style={styles.reportTextInput} value={reportJson} />
        )}
      </SafeAreaView>
    </Screen>
  );
}
