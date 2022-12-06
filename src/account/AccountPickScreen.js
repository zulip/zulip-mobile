/* @flow strict-local */

import React, { useContext, useCallback } from 'react';
import type { Node } from 'react';

import * as api from '../api';
import { TranslationContext } from '../boot/TranslationProvider';
import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import { useGlobalSelector, useGlobalDispatch } from '../react-redux';
import { getAccountStatuses } from '../selectors';
import Centerer from '../common/Centerer';
import ZulipButton from '../common/ZulipButton';
import Logo from '../common/Logo';
import Screen from '../common/Screen';
import ViewPlaceholder from '../common/ViewPlaceholder';
import AccountList from './AccountList';
import { accountSwitch, removeAccount } from '../actions';
import type { ApiResponseServerSettings } from '../api/settings/getServerSettings';
import { showConfirmationDialog, showErrorAlert } from '../utils/info';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'account-pick'>,
  route: RouteProp<'account-pick', void>,
|}>;

export default function AccountPickScreen(props: Props): Node {
  const { navigation } = props;
  const accountStatuses = useGlobalSelector(getAccountStatuses);
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
        try {
          const serverSettings: ApiResponseServerSettings = await api.getServerSettings(realm);
          navigation.push('auth', { serverSettings });
        } catch {
          // TODO: show specific error message from error object
          showErrorAlert(_('Failed to connect to server: {realm}', { realm: realm.toString() }));
        }
      }
    },
    [accountStatuses, dispatch, navigation, _],
  );

  const handleAccountRemove = useCallback(
    (index: number) => {
      const { realm, email } = accountStatuses[index];
      showConfirmationDialog({
        destructive: true,
        title: 'Remove account',
        message: {
          text: 'This will make the mobile app on this device forget {email} on {realmUrl}.',
          values: { realmUrl: realm.toString(), email },
        },
        onPressConfirm: () => {
          dispatch(removeAccount(index));
        },
        _,
      });
    },
    [accountStatuses, _, dispatch],
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
