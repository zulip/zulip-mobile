/* @flow strict-local */

import React, { useContext, useCallback } from 'react';
import type { Node } from 'react';
import invariant from 'invariant';

import { fetchServerSettings } from '../message/fetchActions';
import { TranslationContext } from '../boot/TranslationProvider';
import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import { useGlobalSelector, useGlobalDispatch } from '../react-redux';
import { getAccountStatuses, getAccountsByIdentity, getGlobalSettings } from '../selectors';
import Centerer from '../common/Centerer';
import ZulipButton from '../common/ZulipButton';
import Logo from '../common/Logo';
import Screen from '../common/Screen';
import ViewPlaceholder from '../common/ViewPlaceholder';
import AccountList from './AccountList';
import { accountSwitch, removeAccount } from '../actions';
import { showConfirmationDialog, showErrorAlert } from '../utils/info';
import { tryStopNotifications } from '../notification/notifTokens';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'account-pick'>,
  route: RouteProp<'account-pick', void>,
|}>;

export default function AccountPickScreen(props: Props): Node {
  const { navigation } = props;
  const accountStatuses = useGlobalSelector(getAccountStatuses);

  // In case we need to grab the API for an account (being careful while
  // doing so, of course).
  const accountsByIdentity = useGlobalSelector(getAccountsByIdentity);

  const globalSettings = useGlobalSelector(getGlobalSettings);

  const dispatch = useGlobalDispatch();
  const _ = useContext(TranslationContext);

  const handleAccountSelect = useCallback(
    async (index: number) => {
      const { realm, isLoggedIn } = accountStatuses[index];
      if (isLoggedIn) {
        setTimeout(() => {
          dispatch(accountSwitch(index));
        });
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
    [accountStatuses, globalSettings, dispatch, navigation, _],
  );

  const handleAccountRemove = useCallback(
    (index: number) => {
      const { realm, email, isLoggedIn } = accountStatuses[index];
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
          dispatch(removeAccount(index));
        },
        _,
      });
    },
    [accountStatuses, accountsByIdentity, _, dispatch],
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
