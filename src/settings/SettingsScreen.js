/* @flow strict-local */

import React, { useCallback } from 'react';
import type { Node } from 'react';

import type { RouteProp } from '../react-navigation';
import type { MainTabsNavigationProp } from '../main/MainTabsScreen';
import * as NavigationService from '../nav/NavigationService';
import { useGlobalSelector, useDispatch } from '../react-redux';
import { getGlobalSettings } from '../selectors';
import { NestedNavRow, SwitchRow, Screen } from '../common';
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
  navigation: MainTabsNavigationProp<'settings'>,
  route: RouteProp<'settings', void>,
|}>;

export default function SettingsScreen(props: Props): Node {
  const theme = useGlobalSelector(state => getGlobalSettings(state).theme);
  const browser = useGlobalSelector(state => getGlobalSettings(state).browser);
  const doNotMarkMessagesAsRead = useGlobalSelector(
    state => getGlobalSettings(state).doNotMarkMessagesAsRead,
  );
  const dispatch = useDispatch();

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
          NavigationService.dispatch(navigateToNotifications());
        }}
      />
      <NestedNavRow
        Icon={IconLanguage}
        label="Language"
        onPress={() => {
          NavigationService.dispatch(navigateToLanguage());
        }}
      />
      <NestedNavRow
        Icon={IconDiagnostics}
        label="Diagnostics"
        onPress={() => {
          NavigationService.dispatch(navigateToDiagnostics());
        }}
      />
      <NestedNavRow
        Icon={IconMoreHorizontal}
        label="Legal"
        onPress={() => {
          NavigationService.dispatch(navigateToLegal());
        }}
      />
    </Screen>
  );
}
