/* @flow strict-local */
import React, { useContext } from 'react';
import type { Node } from 'react';
import { ScrollView, View, Alert } from 'react-native';

import type { RouteProp } from '../react-navigation';
import type { MainTabsNavigationProp } from '../main/MainTabsScreen';
import * as NavigationService from '../nav/NavigationService';
import { createStyleSheet } from '../styles';
import { useSelector } from '../react-redux';
import { ZulipButton } from '../common';
import {
  navigateToAccountPicker,
  navigateToUserStatus,
  navigateToAccountSetting,
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

function AccountSettingButton(props: {||}) {
  return (
    <ZulipButton
      style={styles.button}
      secondary
      text="Account Setting"
      onPress={() => {
        NavigationService.dispatch(navigateToAccountSetting());
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
      </View>
      <View style={styles.buttonRow}>
        <AccountSettingButton />
      </View>
    </ScrollView>
  );
}
