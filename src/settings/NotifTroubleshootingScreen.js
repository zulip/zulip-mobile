/* @flow strict-local */

import invariant from 'invariant';
import * as React from 'react';
import { Platform, View, ScrollView, NativeModules } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Clipboard from '@react-native-clipboard/clipboard';
import * as MailComposer from 'expo-mail-composer';
import { nativeApplicationVersion } from 'expo-application';
// $FlowFixMe[untyped-import]
import uniq from 'lodash.uniq';
import subDays from 'date-fns/subDays';

import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import Screen from '../common/Screen';
import { createStyleSheet } from '../styles';
import { useDispatch, useGlobalSelector, useSelector } from '../react-redux';
import { getRealmName } from '../selectors';
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
import { showErrorAlert, showToast } from '../utils/info';
import Input from '../common/Input';
import { identityOfAccount, keyOfIdentity } from '../account/accountMisc';
import AlertItem from '../common/AlertItem';
import ZulipText from '../common/ZulipText';
import type { Identity, LocalizableText, LocalizableReactText } from '../types';
import type { SubsetProperties } from '../generics';
import type { ZulipVersion } from '../utils/zulipVersion';
import { androidBrand, androidManufacturer, androidModel, useAppState } from '../reactNativeUtils';
import * as logging from '../utils/logging';
import { getHaveServerData } from '../haveServerDataSelectors';
import { TranslationContext } from '../boot/TranslationProvider';
import isAppOwnDomain from '../isAppOwnDomain';
import { openLinkWithUserPreference, openSystemNotificationSettings } from '../utils/openLink';
import { initNotifications } from '../notification/notifTokens';
import { ApiError } from '../api/apiErrors';
import NavRow from '../common/NavRow';
import RowGroup from '../common/RowGroup';
import TextRow from '../common/TextRow';
import type { PerAccountState } from '../reduxTypes';
import { useDateRefreshedAtInterval } from '../reactUtils';

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
  TokenUnknown = 1,
  SystemSettingsDisabled = 2,
  GooglePlayServicesNotAvailable = 3,
  ServerHasNotEnabled = 4,

  // TODO: more, such as:
  //   - Can't reach the server (ideally after #5615, to be less buggy)
  //   - Android notification sound file missing (#5484)
}

const notifProblemsHighToLowShortTextPrecedence: $ReadOnlyArray<NotificationProblem> = [
  NotificationProblem.SystemSettingsDisabled,
  NotificationProblem.GooglePlayServicesNotAvailable,
  NotificationProblem.ServerHasNotEnabled,
  NotificationProblem.TokenNotAcked,
  NotificationProblem.TokenUnknown,
];

invariant(
  new Set(notifProblemsHighToLowShortTextPrecedence).size
    === [...NotificationProblem.members()].length,
  'notifProblemsHighToLowShortTextPrecedence missing or duplicate members',
);

/**
 * Which of a NotificationReport's `problem`s to show short text for if any.
 *
 * Use this with notifProblemShortText and notifProblemShortReactText,
 * where there's room for just one problem's short text, like in the
 * NavRow leading to the notification settings screen.
 */
export const chooseNotifProblemForShortText = (args: {|
  // eslint-disable-next-line no-use-before-define
  report: { +problems: NotificationReport['problems'], ... },
  ignoreServerHasNotEnabled?: boolean,
|}): NotificationProblem | null => {
  const { report, ignoreServerHasNotEnabled = false } = args;
  const result = notifProblemsHighToLowShortTextPrecedence.find(p => {
    if (p === NotificationProblem.ServerHasNotEnabled && ignoreServerHasNotEnabled) {
      return false;
    }
    return report.problems.includes(p);
  });

  return result ?? null;
};

/**
 * A one-line summary of a NotificationProblem, as LocalizableText.
 *
 * For this as a LocalizableReactText, see notifProblemShortReactText.
 */
export const notifProblemShortText = (
  problem: NotificationProblem,
  realmName: string,
): LocalizableText => {
  switch (problem) {
    case NotificationProblem.TokenNotAcked:
    case NotificationProblem.TokenUnknown:
      return 'Notifications for this account may not arrive.';
    case NotificationProblem.SystemSettingsDisabled:
      return 'Notifications are disabled in system settings.';
    case NotificationProblem.GooglePlayServicesNotAvailable:
      return 'Notifications require Google Play Services, which is unavailable.';
    case NotificationProblem.ServerHasNotEnabled:
      return {
        text: 'Push notifications are not enabled for {realmName}.',
        values: { realmName },
      };
  }
};

/**
 * A one-line summary of a NotificationProblem, as LocalizableReactText.
 *
 * For this as a LocalizableText, see notifProblemShortText.
 */
export const notifProblemShortReactText = (
  problem: NotificationProblem,
  realmName: string,
): LocalizableReactText => {
  switch (problem) {
    case NotificationProblem.TokenNotAcked:
    case NotificationProblem.TokenUnknown:
    case NotificationProblem.SystemSettingsDisabled:
    case NotificationProblem.GooglePlayServicesNotAvailable:
      return notifProblemShortText(problem, realmName);
    case NotificationProblem.ServerHasNotEnabled:
      return {
        text: 'Push notifications are not enabled for {realmName}.',
        values: {
          realmName: (
            <ZulipText
              inheritColor
              inheritFontSize
              style={{ fontWeight: 'bold' }}
              text={realmName}
            />
          ),
        },
      };
  }
};

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
  +manufacturer?: string,
  +brand?: string,
  +model?: string,
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
    +pushNotificationsEnabledEndTimestamp: number | null,
    +endTimestampIsNear: boolean,
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

export const kPushNotificationsEnabledEndDoc: URL = new URL(
  'https://zulip.com/help/self-hosted-billing#upgrades-for-legacy-customers',
);

export const pushNotificationsEnabledEndTimestampWarning = (
  state: PerAccountState,
  dateNow: Date,
): {| text: LocalizableText, reactText: LocalizableReactText |} | null => {
  if (!getHaveServerData(state)) {
    return null;
  }
  const realmState = getRealm(state);
  const timestamp = realmState.pushNotificationsEnabledEndTimestamp;
  if (timestamp == null) {
    return null;
  }
  const timestampMs = timestamp * 1000;
  if (subDays(new Date(timestampMs), 15) > dateNow) {
    return null;
  }
  const realmName = realmState.name;
  const twentyFourHourTime = realmState.twentyFourHourTime;
  const message = twentyFourHourTime
    ? 'On {endTimestamp, date, short} at {endTimestamp, time, ::H:mm z}, push notifications will be disabled for {realmName}.'
    : 'On {endTimestamp, date, short} at {endTimestamp, time, ::h:mm z}, push notifications will be disabled for {realmName}.';
  return {
    text: {
      text: message,
      values: { endTimestamp: timestampMs, realmName },
    },
    reactText: {
      text: message,
      values: {
        endTimestamp: timestampMs,
        realmName: (
          <ZulipText inheritColor inheritFontSize style={{ fontWeight: 'bold' }} text={realmName} />
        ),
      },
    },
  };
};

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

  const dateNow = useDateRefreshedAtInterval(60_000);

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
                  pushNotificationsEnabledEndTimestamp:
                    getRealm(activeAccountState).pushNotificationsEnabledEndTimestamp,
                  endTimestampIsNear:
                    pushNotificationsEnabledEndTimestampWarning(activeAccountState, dateNow)
                    != null,
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
            if (pushToken == null) {
              problems.push(NotificationProblem.TokenUnknown);
            } else if (pushToken !== ackedPushToken) {
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
              ...(Platform.OS === 'android' && {
                manufacturer: androidManufacturer(),
                brand: androidBrand(),
                model: androidModel(),
              }),
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
    [nativeState, accounts, activeAccountState, pushToken, platform, dateNow],
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
  const dispatch = useDispatch();

  const settings = useGlobalSelector(getGlobalSettings);

  const account = useSelector(getAccount);
  const identity = identityOfAccount(account);
  const realmName = useSelector(getRealmName);

  const notificationReportsByIdentityKey = useNotificationReportsByIdentityKey();
  const report = notificationReportsByIdentityKey.get(keyOfIdentity(identityOfAccount(account)));
  invariant(report, 'NotifTroubleshootingScreen: expected report');

  const styles = React.useMemo(
    () =>
      createStyleSheet({
        contentArea: {
          flex: 1,
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

  const handlePressRetryRegister = React.useCallback(async () => {
    try {
      await dispatch(initNotifications());
    } catch (errorIllTyped) {
      const error: mixed = errorIllTyped; // https://github.com/facebook/flow/issues/2470

      if (!(error instanceof Error)) {
        logging.error('Unexpected non-error thrown');
      }

      let msg = undefined;
      if (error instanceof ApiError) {
        msg = _('The server said:\n\n{errorMessage}', {
          errorMessage: error.message,
        });
      } else if (error instanceof Error && error.message.length > 0) {
        msg = error.message;
      }
      showErrorAlert(_('Registration failed'), msg);
    }
  }, [_, dispatch]);

  const reportJson = React.useMemo(() => jsonifyNotificationReport(report), [report]);

  const handlePressCopy = React.useCallback(() => {
    Clipboard.setString(reportJson);
    showToast(_('Copied'));
  }, [reportJson, _]);

  const mailComposerIsAvailable = useMailComposerIsAvailable();

  const handlePressTroubleshootingGuide = React.useCallback(() => {
    openLinkWithUserPreference(
      new URL('https://zulip.com/help/mobile-notifications#troubleshooting-mobile-notifications'),
      settings,
    );
  }, [settings]);

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
        logging.warn('NotifTroubleshootingScreen: MailComposer reports a sent email.');
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
        text: 'Notifications for this account may not arrive. Please refer to the troubleshooting guide or contact {supportEmail} with the details below.',
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
            text={notifProblemShortReactText(problem, realmName)}
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
          <AlertItem bottomMargin text={notifProblemShortReactText(problem, realmName)} />,
        );
        break;

      case NotificationProblem.ServerHasNotEnabled:
        alerts.push(
          <AlertItem
            bottomMargin
            text={notifProblemShortReactText(problem, realmName)}
            buttons={[
              {
                id: 'learn-more',
                label: 'Learn more',
                onPress: () => {
                  openLinkWithUserPreference(
                    new URL(
                      'https://zulip.com/help/mobile-notifications#enabling-push-notifications-for-self-hosted-servers',
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
        invariant(
          report.registerPushTokenRequestsInProgress != null,
          'report.registerPushTokenRequestsInProgress missing for active account?',
        );
        const isInProgress = report.registerPushTokenRequestsInProgress > 0;
        alerts.push(
          <AlertItem
            bottomMargin
            text={{
              text: isInProgress
                ? 'The Zulip server at {realm} has not yet registered your device token. A request is in progress.'
                : 'The Zulip server at {realm} has not yet registered your device token.',
              values: { realm: identity.realm.toString() },
            }}
            buttons={
              isInProgress
                ? undefined
                : [{ id: 'retry', label: 'Retry', onPress: handlePressRetryRegister }]
            }
          />,
        );

        alerts.push(genericAlert); // Still point to support for good measure
        break;
      }

      case NotificationProblem.TokenUnknown: {
        // TODO: Could offer:
        //   - Re-request the device token from the platform (#5329 may be
        //     an obstacle), and show if a/the request hasn't completed
        alerts.push(genericAlert);
        break;
      }
    }
  });

  return (
    <Screen scrollEnabled={false} title="Troubleshooting">
      <SafeAreaView mode="padding" edges={['right', 'left']} style={styles.contentArea}>
        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          {
            // TODO: Avoid comparing these complex UI-describing objects:
            //   https://github.com/zulip/zulip-mobile/pull/5654#discussion_r1105122407
            uniq(alerts) // Deduplicate genericAlert, which multiple problems might map to
          }
        </View>
        <RowGroup>
          {(() => {
            const children = [];
            children.push(
              <NavRow
                type="external"
                title="Troubleshooting guide"
                onPress={handlePressTroubleshootingGuide}
              />,
            );
            if (mailComposerIsAvailable === true) {
              children.push(
                <TextRow
                  title={{
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
                />,
              );
            }
            children.push(<TextRow title="Copy to clipboard" onPress={handlePressCopy} />);
            return children;
          })()}
        </RowGroup>
        <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16, flex: 1 }}>
          {Platform.OS === 'android' ? (
            // ScrollView for Android-only symptoms like
            // facebook/react-native#23117
            <ScrollView style={{ flex: 1 }}>
              <Input editable={false} multiline style={styles.reportTextInput} value={reportJson} />
            </ScrollView>
          ) : (
            <Input editable={false} multiline style={styles.reportTextInput} value={reportJson} />
          )}
        </View>
      </SafeAreaView>
    </Screen>
  );
}
