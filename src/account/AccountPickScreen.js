/* @flow strict-local */

import React, { useContext, useCallback } from 'react';
import type { Node } from 'react';
import { Alert } from 'react-native';

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
import {
  navigateToRealmInputScreen,
  accountSwitch,
  removeAccount,
  navigateToAuth,
} from '../actions';
import type { ApiResponseServerSettings } from '../api/settings/getServerSettings';
import { showErrorAlert } from '../utils/info';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'account-pick'>,
  route: RouteProp<'account-pick', void>,
|}>;

export default function AccountPickScreen(props: Props): Node {
  const { navigation } = props;
  const accounts = useGlobalSelector(getAccountStatuses);
  const dispatch = useGlobalDispatch();
  const _ = useContext(TranslationContext);

  const handleAccountSelect = useCallback(
    async (index: number) => {
      const { realm, isLoggedIn } = accounts[index];
      if (isLoggedIn) {
        setTimeout(() => {
          dispatch(accountSwitch(index));
        });
      } else {
        try {
          const serverSettings: ApiResponseServerSettings = await api.getServerSettings(realm);
          navigation.dispatch(navigateToAuth(serverSettings));
        } catch {
          // TODO: show specific error message from error object
          showErrorAlert(_('Failed to connect to server: {realm}', { realm: realm.toString() }));
        }
      }
    },
    [accounts, dispatch, navigation, _],
  );

  const handleAccountRemove = useCallback(
    (index: number) => {
      const { realm, email } = accounts[index];
      Alert.alert(
        _('Remove account?'),
        _('This will make the mobile app on this device forget {email} on {realmUrl}.', {
          realmUrl: realm.toString(),
          email,
        }),
        [
          { text: _('Cancel'), style: 'cancel' },
          {
            text: _('Remove account'),
            style: 'destructive',
            onPress: () => {
              dispatch(removeAccount(index));
            },
          },
        ],
        { cancelable: true },
      );
    },
    [accounts, _, dispatch],
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
        {accounts.length === 0 && <Logo />}
        <AccountList
          accounts={accounts}
          onAccountSelect={handleAccountSelect}
          onAccountRemove={handleAccountRemove}
        />
        <ViewPlaceholder height={16} />
        <ZulipButton
          text="Add new account"
          onPress={() => {
            navigation.dispatch(navigateToRealmInputScreen());
          }}
        />
      </Centerer>
    </Screen>
  );
}
