/* @flow strict-local */

import React, { useCallback } from 'react';
import type { Node } from 'react';

import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import { useGlobalSelector, useDispatch } from '../react-redux';
import { getGlobalSettings } from '../selectors';
import NestedNavRow from '../common/NestedNavRow';
import SwitchRow from '../common/SwitchRow';
import Screen from '../common/Screen';
import {
  IconDiagnostics,
  IconNotifications,
  IconLanguage,
  IconMoreHorizontal,
} from '../common/Icons';
import {
  setGlobalSettings,
  navigateToNotifications,
  navigateToLanguage,
  navigateToDiagnostics,
  navigateToLegal,
} from '../actions';
import { shouldUseInAppBrowser } from '../utils/openLink';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'settings'>,
  route: RouteProp<'settings', void>,
|}>;

export default function SettingsScreen(props: Props): Node {
  const theme = useGlobalSelector(state => getGlobalSettings(state).theme);
  const browser = useGlobalSelector(state => getGlobalSettings(state).browser);
  const doNotMarkMessagesAsRead = useGlobalSelector(
    state => getGlobalSettings(state).doNotMarkMessagesAsRead,
  );
  const dispatch = useDispatch();
  const { navigation } = props;

  const handleThemeChange = useCallback(() => {
    dispatch(setGlobalSettings({ theme: theme === 'default' ? 'night' : 'default' }));
  }, [theme, dispatch]);

  return (
    <Screen title="Settings">
      <SwitchRow label="Night mode" value={theme === 'night'} onValueChange={handleThemeChange} />
      <SwitchRow
        label="Open links with in-app browser"
        value={shouldUseInAppBrowser(browser)}
        onValueChange={value => {
          dispatch(setGlobalSettings({ browser: value ? 'embedded' : 'external' }));
        }}
      />
      <SwitchRow
        label="Do not mark messages read on scroll"
        value={doNotMarkMessagesAsRead}
        onValueChange={value => {
          dispatch(setGlobalSettings({ doNotMarkMessagesAsRead: value }));
        }}
      />
      <NestedNavRow
        Icon={IconNotifications}
        label="Notifications"
        onPress={() => {
          navigation.dispatch(navigateToNotifications());
        }}
      />
      <NestedNavRow
        Icon={IconLanguage}
        label="Language"
        onPress={() => {
          navigation.dispatch(navigateToLanguage());
        }}
      />
      <NestedNavRow
        Icon={IconDiagnostics}
        label="Diagnostics"
        onPress={() => {
          navigation.dispatch(navigateToDiagnostics());
        }}
      />
      <NestedNavRow
        Icon={IconMoreHorizontal}
        label="Legal"
        onPress={() => {
          navigation.dispatch(navigateToLegal());
        }}
      />
    </Screen>
  );
}
