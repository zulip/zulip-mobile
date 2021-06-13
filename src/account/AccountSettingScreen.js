/* @flow strict-local */
import React, { useContext } from 'react';
import { View, Alert } from 'react-native';

import { TranslationContext } from '../boot/TranslationProvider';
import type { RouteProp } from '../react-navigation';
import { useDispatch, useSelector } from '../react-redux';
import * as NavigationService from '../nav/NavigationService';
import type { AppNavigationProp } from '../nav/AppNavigator';
import { createStyleSheet } from '../styles';
import { ZulipButton, Screen } from '../common';
import { logout, tryStopNotifications, navigateToAccountDeactivate } from '../actions';
import { getActiveAccount } from './accountsSelectors';

const styles = createStyleSheet({
  buttonRow: {
    flexDirection: 'row',
    marginHorizontal: 8,
  },
  deactivateText: {
    color: 'hsl(356.7,63.9%,71.8%)',
  },
  deactivateButton: {
    flex: 1,
    margin: 8,
    borderColor: 'hsl(3.5,54.8%,81.8%)',
  },
  button: {
    flex: 1,
    margin: 8,
  },
});

function LogoutButton(props: {||}) {
  const dispatch = useDispatch();
  const _ = useContext(TranslationContext);
  const activeAccount = useSelector(getActiveAccount);
  return (
    <ZulipButton
      style={styles.button}
      secondary
      text="Log out"
      onPress={() => {
        Alert.alert(
          _('Log out?'),
          _('This will log out {email} on {realmUrl} from the mobile app on this device.', {
            email: activeAccount.email,
            realmUrl: activeAccount.realm.toString(),
          }),
          [
            { text: _('Cancel'), style: 'cancel' },
            {
              text: _('Log out'),
              style: 'destructive',
              onPress: () => {
                dispatch(tryStopNotifications());
                dispatch(logout());
              },
            },
          ],
          { cancelable: true },
        );
      }}
    />
  );
}

function DeactivateAccountButton(props: {||}) {
  return (
    <ZulipButton
      style={styles.deactivateButton}
      secondary
      text="Deactivate account"
      textStyle={styles.deactivateText}
      onPress={() => {
        NavigationService.dispatch(navigateToAccountDeactivate());
      }}
    />
  );
}

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'account-setting'>,
  route: RouteProp<'account-setting', void>,
|}>;

export default function AccountSettingScreen(props: Props) {
  return (
    <Screen title="Account setting" centerContent padding canGoBack shouldShowLoadingBanner={false}>
      <View>
        <LogoutButton />
        <DeactivateAccountButton />
      </View>
    </Screen>
  );
}
