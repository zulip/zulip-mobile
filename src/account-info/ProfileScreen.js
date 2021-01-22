/* @flow strict-local */
import React from 'react';
import { ScrollView, View } from 'react-native';

import type { MainTabsNavigationProp, MainTabsRouteProp } from '../main/MainTabsScreen';
import * as NavigationService from '../nav/NavigationService';
import { createStyleSheet } from '../styles';
import { useDispatch, useSelector } from '../react-redux';
import { ZulipButton } from '../common';
import {
  logout,
  tryStopNotifications,
  navigateToAccountPicker,
  navigateToUserStatus,
} from '../actions';
import AccountDetails from './AccountDetails';
import AwayStatusSwitch from './AwayStatusSwitch';
import { getOwnUser } from '../users/userSelectors';

const styles = createStyleSheet({
  buttonRow: {
    flexDirection: 'row',
    marginHorizontal: 8,
  },
  button: {
    flex: 1,
    margin: 8,
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
      onPress={() => {
        NavigationService.dispatch(navigateToAccountPicker());
      }}
    />
  );
}

function LogoutButton(props: {||}) {
  const dispatch = useDispatch();
  return (
    <ZulipButton
      style={styles.button}
      secondary
      text="Log out"
      onPress={() => {
        dispatch(tryStopNotifications());
        dispatch(logout());
      }}
    />
  );
}

type Props = $ReadOnly<{|
  navigation: MainTabsNavigationProp<'profile'>,
  route: MainTabsRouteProp<'profile'>,
|}>;

/**
 * This is similar to `AccountDetails` but used to show the current users account.
 * It does not have a "Send private message" but has "Switch account" and "Log out" buttons.
 *
 * The user can still open `AccountDetails` on themselves via the (i) icon in a chat screen.
 */
export default function ProfileScreen(props: Props) {
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
      </View>
    </ScrollView>
  );
}
