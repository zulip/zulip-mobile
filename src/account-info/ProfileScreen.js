/* @flow strict-local */
import React, { useContext } from 'react';
import type { Node } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { type UserId } from '../api/idTypes';
import { TranslationContext } from '../boot/TranslationProvider';
import type { RouteProp } from '../react-navigation';
import type { MainTabsNavigationProp } from '../main/MainTabsScreen';
import { createStyleSheet } from '../styles';
import { useDispatch, useSelector } from '../react-redux';
import ZulipButton from '../common/ZulipButton';
import { logout } from '../account/logoutActions';
import { tryStopNotifications } from '../notification/notifTokens';
import AccountDetails from './AccountDetails';
import AwayStatusSwitch from './AwayStatusSwitch';
import { getOwnUser } from '../users/userSelectors';
import { getIdentity } from '../account/accountsSelectors';
import { useNavigation } from '../react-navigation';
import { showConfirmationDialog } from '../utils/info';
import { OfflineNoticePlaceholder } from '../boot/OfflineNoticeProvider';

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
        showConfirmationDialog({
          destructive: true,
          title: 'Log out',
          message: {
            text: 'This will log out {email} on {realmUrl} from the mobile app on this device.',
            values: { email: identity.email, realmUrl: identity.realm.toString() },
          },
          onPressConfirm: () => {
            dispatch(tryStopNotifications());
            dispatch(logout());
          },
          _,
        });
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
    <SafeAreaView mode="padding" edges={['top']} style={{ flex: 1 }}>
      <OfflineNoticePlaceholder />
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
    </SafeAreaView>
  );
}
