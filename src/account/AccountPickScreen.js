/* @flow strict-local */

import React, { useContext, useCallback } from 'react';
import type { Node } from 'react';
import invariant from 'invariant';

import { fetchServerSettings } from '../message/fetchActions';
import { TranslationContext } from '../boot/TranslationProvider';
import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import { useGlobalSelector, useGlobalDispatch } from '../react-redux';
import { getAccountsByIdentity, getGlobalSettings } from '../selectors';
import Centerer from '../common/Centerer';
import ZulipButton from '../common/ZulipButton';
import Logo from '../common/Logo';
import Screen from '../common/Screen';
import ViewPlaceholder from '../common/ViewPlaceholder';
import AccountList from './AccountList';
import { accountSwitch, removeAccount } from '../actions';
import { showConfirmationDialog, showErrorAlert } from '../utils/info';
import { tryStopNotifications } from '../notification/notifTokens';
import type { Identity } from '../types';
import { getAccounts } from '../directSelectors';
import { useNotificationReportsByIdentityKey } from '../settings/NotifTroubleshootingScreen';
import { keyOfIdentity } from './accountMisc';
import type { NotificationReport } from '../settings/NotifTroubleshootingScreen';

/** The data needed for each item in the list-of-accounts UI. */
export type AccountStatus = {|
  ...Identity,
  isLoggedIn: boolean,

  // The issue-report data from NotifTroubleshootingScreen has a convenient
  // list of problems that are likely to prevent notifications from working.
  // We'll use it to warn on each account item that has problems.
  +notificationReport: { +problems: NotificationReport['problems'], ... },
|};

/**
 * The data needed for the list of accounts in this UI.
 *
 * This serves as a view-model for the use of this component.
 */
function useAccountStatuses(): $ReadOnlyArray<AccountStatus> {
  const accounts = useGlobalSelector(getAccounts);
  const notificationReportsByIdentityKey = useNotificationReportsByIdentityKey();

  return accounts.map(({ realm, email, apiKey }) => {
    const notificationReport = notificationReportsByIdentityKey.get(
      keyOfIdentity({ realm, email }),
    );
    invariant(notificationReport, 'AccountPickScreen: expected notificationReport for identity');

    return {
      realm,
      email,
      isLoggedIn: apiKey !== '',
      notificationReport,
    };
  });
}

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'account-pick'>,
  route: RouteProp<'account-pick', void>,
|}>;

export default function AccountPickScreen(props: Props): Node {
  const { navigation } = props;
  const accountStatuses = useAccountStatuses();

  // In case we need to grab the API for an account (being careful while
  // doing so, of course).
  const accountsByIdentity = useGlobalSelector(getAccountsByIdentity);

  const globalSettings = useGlobalSelector(getGlobalSettings);

  const dispatch = useGlobalDispatch();
  const _ = useContext(TranslationContext);

  const handleAccountSelect = useCallback(
    async accountStatus => {
      const { realm, email, isLoggedIn } = accountStatus;
      if (isLoggedIn) {
        dispatch(accountSwitch({ realm, email }));
      } else {
        const result = await fetchServerSettings(realm);
        if (result.type === 'error') {
          showErrorAlert(
            _(result.title),
            _(result.message),
            result.learnMoreButton && {
              url: result.learnMoreButton.url,
              text:
                result.learnMoreButton.text != null ? _(result.learnMoreButton.text) : undefined,
              globalSettings,
            },
          );
          return;
        }
        const serverSettings = result.value;
        navigation.push('auth', { serverSettings });
      }
    },
    [globalSettings, dispatch, navigation, _],
  );

  const handleAccountRemove = useCallback(
    accountStatus => {
      const { realm, email, isLoggedIn } = accountStatus;
      const account = accountsByIdentity({ realm, email });
      invariant(account, 'AccountPickScreen: should have account');

      showConfirmationDialog({
        destructive: true,
        title: 'Remove account',
        message: {
          text: 'This will make the mobile app on this device forget {email} on {realmUrl}.',
          values: { realmUrl: realm.toString(), email },
        },
        onPressConfirm: () => {
          if (isLoggedIn) {
            // Don't delay the removeAccount action by awaiting this
            // request: it may take a long time or never succeed, and the
            // user expects the account to be removed from the list
            // immediately.
            dispatch(tryStopNotifications(account));
          }
          dispatch(removeAccount({ realm, email }));
        },
        _,
      });
    },
    [accountsByIdentity, _, dispatch],
  );

  return (
    <Screen
      title="Pick account"
      centerContent
      padding
      canGoBack={navigation.canGoBack()}
      shouldShowLoadingBanner={false}
    >
      <Centerer>
        {accountStatuses.length === 0 && <Logo />}
        <AccountList
          accountStatuses={accountStatuses}
          onAccountSelect={handleAccountSelect}
          onAccountRemove={handleAccountRemove}
        />
        <ViewPlaceholder height={16} />
        <ZulipButton
          text="Add new account"
          onPress={() => {
            navigation.push('realm-input', { initial: undefined });
          }}
        />
      </Centerer>
    </Screen>
  );
}
