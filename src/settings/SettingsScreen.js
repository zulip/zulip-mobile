/* @flow strict-local */

import React, { useCallback } from 'react';
import type { Node } from 'react';

import type { RouteProp } from '../react-navigation';
import type { AppNavigationProp } from '../nav/AppNavigator';
import { useGlobalSelector, useDispatch } from '../react-redux';
import { getGlobalSettings } from '../selectors';
import NestedNavRow from '../common/NestedNavRow';
import InputRowRadioButtons from '../common/InputRowRadioButtons';
import SwitchRow from '../common/SwitchRow';
import Screen from '../common/Screen';
import {
  IconDiagnostics,
  IconNotifications,
  IconLanguage,
  IconMoreHorizontal,
} from '../common/Icons';
import { setGlobalSettings } from '../actions';
import { shouldUseInAppBrowser } from '../utils/openLink';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'settings'>,
  route: RouteProp<'settings', void>,
|}>;

export default function SettingsScreen(props: Props): Node {
  const theme = useGlobalSelector(state => getGlobalSettings(state).theme);
  const browser = useGlobalSelector(state => getGlobalSettings(state).browser);
  const markMessagesReadOnScroll = useGlobalSelector(
    state => getGlobalSettings(state).markMessagesReadOnScroll,
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
      <InputRowRadioButtons
        navigation={navigation}
        label="Mark messages as read on scroll"
        description="When scrolling through messages, should they automatically be marked as read?"
        valueKey={markMessagesReadOnScroll}
        items={[
          { key: 'always', title: 'Always' },
          { key: 'never', title: 'Never' },
          {
            key: 'conversation-views-only',
            title: 'Only in conversation views',
            subtitle:
              'Messages will be automatically marked as read only when viewing a single topic or private message conversation.',
          },
        ]}
        onValueChange={value => {
          dispatch(setGlobalSettings({ markMessagesReadOnScroll: value }));
        }}
      />
      <NestedNavRow
        Icon={IconNotifications}
        label="Notifications"
        onPress={() => {
          navigation.push('notifications');
        }}
      />
      <NestedNavRow
        Icon={IconLanguage}
        label="Language"
        onPress={() => {
          navigation.push('language');
        }}
      />
      <NestedNavRow
        Icon={IconDiagnostics}
        label="Diagnostics"
        onPress={() => {
          navigation.push('diagnostics');
        }}
      />
      <NestedNavRow
        Icon={IconMoreHorizontal}
        label="Legal"
        onPress={() => {
          navigation.push('legal');
        }}
      />
    </Screen>
  );
}
