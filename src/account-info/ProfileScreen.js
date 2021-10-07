/* @flow strict-local */
import React, { useContext } from 'react';
import type { Node } from 'react';
import { ScrollView, View, Alert } from 'react-native';

import { TranslationContext } from '../boot/TranslationProvider';
import type { RouteProp } from '../react-navigation';
import type { MainTabsNavigationProp } from '../main/MainTabsScreen';
import * as NavigationService from '../nav/NavigationService';
import { createStyleSheet } from '../styles';
import { useDispatch, useSelector } from '../react-redux';
import { ZulipButton } from '../common';
import {
  logout,
  tryStopNotifications,
  navigateToAccountPicker,
  navigateToUserStatus,
  navigateToAccountDeactivate,
} from '../actions';
import AccountDetails from './AccountDetails';
import AwayStatusSwitch from './AwayStatusSwitch';
import { getOwnUser } from '../users/userSelectors';
import { getIdentity } from '../account/accountsSelectors';

const styles = createStyleSheet({
  buttonRow: {
    flexDirection: 'row',
    marginHorizontal: 8,
  },
  button: {
    flex: 1,
    margin: 8,
  },
  deactivateText: {
    color: 'hsl(356.7,63.9%,71.8%)',
  },
  deactivateButton: {
    flex: 1,
    margin: 8,
    borderColor: 'hsl(3.5,54.8%,81.8%)',
  },
  switchText: {
    fontSize: 15,
  },
});

function SetStatusButton(props: {||}) {
  return (
    <ZulipButton
      style={styles.button}
      secondary
      text="Set a status"
      onPress={() => {
        NavigationService.dispatch(navigateToUserStatus());
      }}
    />
  );
}

function SwitchAccountButton(props: {||}) {
  return (
    <ZulipButton
      style={styles.button}
      secondary
      text="Switch account"
      textStyle={styles.switchText}
      onPress={() => {
        NavigationService.dispatch(navigateToAccountPicker());
      }}
    />
  );
}

function LogoutButton(props: {||}) {
  const dispatch = useDispatch();
  const _ = useContext(TranslationContext);
  const identity = useSelector(getIdentity);
  return (
    <ZulipButton
      style={styles.button}
      secondary
      text="Log out"
      onPress={() => {
        Alert.alert(
          _('Log out?'),
          _('This will log out {email} on {realmUrl} from the mobile app on this device.', {
            email: identity.email,
            realmUrl: identity.realm.toString(),
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
      text="Deactivate"
      textStyle={styles.deactivateText}
      onPress={() => {
        NavigationService.dispatch(navigateToAccountDeactivate());
      }}
    />
  );
}

type Props = $ReadOnly<{|
  navigation: MainTabsNavigationProp<'profile'>,
  route: RouteProp<'profile', void>,
|}>;

/**
 * This is similar to `AccountDetails` but used to show the current users account.
 * It does not have a "Send private message" but has "Switch account" and "Log out" buttons.
 *
 * The user can still open `AccountDetails` on themselves via the (i) icon in a chat screen.
 */
export default function ProfileScreen(props: Props): Node {
  const ownUser = useSelector(getOwnUser);

  return (
    <ScrollView>
      <AccountDetails user={ownUser} />
      <AwayStatusSwitch />
      <View style={styles.buttonRow}>
        <SetStatusButton />
      </View>
      <View style={styles.buttonRow}>
        <SwitchAccountButton />
        <LogoutButton />
        <DeactivateAccountButton />
      </View>
    </ScrollView>
  );
}
