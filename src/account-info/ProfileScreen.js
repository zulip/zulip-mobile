/* @flow strict-local */
import React, { useContext } from 'react';
import type { Node } from 'react';
import { ScrollView, View, Alert } from 'react-native';

import { type UserId } from '../api/idTypes';
import { TranslationContext } from '../boot/TranslationProvider';
import type { RouteProp } from '../react-navigation';
import type { MainTabsNavigationProp } from '../main/MainTabsScreen';
import { createStyleSheet } from '../styles';
import { useDispatch, useSelector } from '../react-redux';
import ZulipButton from '../common/ZulipButton';
import { logout } from '../actions';
import { tryStopNotifications } from '../notification/notifTokens';
import AccountDetails from './AccountDetails';
import AwayStatusSwitch from './AwayStatusSwitch';
import { getOwnUser } from '../users/userSelectors';
import { getIdentity } from '../account/accountsSelectors';
import { useNavigation } from '../react-navigation';

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
  const navigation = useNavigation();
  return (
    <ZulipButton
      style={styles.button}
      secondary
      text="Set a status"
      onPress={() => {
        navigation.push('user-status');
      }}
    />
  );
}

function ProfileButton(props: {| +ownUserId: UserId |}) {
  const navigation = useNavigation();
  return (
    <ZulipButton
      style={styles.button}
      secondary
      text="Full profile"
      onPress={() => {
        navigation.push('account-details', { userId: props.ownUserId });
      }}
    />
  );
}

function SettingsButton(props: {||}) {
  const navigation = useNavigation();
  return (
    <ZulipButton
      style={styles.button}
      secondary
      text="Settings"
      onPress={() => {
        navigation.push('settings');
      }}
    />
  );
}

function SwitchAccountButton(props: {||}) {
  const navigation = useNavigation();
  return (
    <ZulipButton
      style={styles.button}
      secondary
      text="Switch account"
      onPress={() => {
        navigation.push('account-pick');
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

type Props = $ReadOnly<{|
  navigation: MainTabsNavigationProp<'profile'>,
  route: RouteProp<'profile', void>,
|}>;

/**
 * The profile/settings/account screen we offer among the main tabs of the app.
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
        <ProfileButton ownUserId={ownUser.user_id} />
      </View>
      <View style={styles.buttonRow}>
        <SettingsButton />
      </View>
      <View style={styles.buttonRow}>
        <SwitchAccountButton />
        <LogoutButton />
      </View>
    </ScrollView>
  );
}
