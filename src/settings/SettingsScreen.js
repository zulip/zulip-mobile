/* @flow strict-local */

import React, { useCallback } from 'react';
import type { Node } from 'react';
import { View } from 'react-native';
// $FlowFixMe[untyped-import]
import { Picker } from '@react-native-picker/picker';
import type { RouteProp } from '../react-navigation';
import type { MainTabsNavigationProp } from '../main/MainTabsScreen';
import * as NavigationService from '../nav/NavigationService';
import { useGlobalSelector, useDispatch } from '../react-redux';
import { getGlobalSettings } from '../selectors';
import NestedNavRow from '../common/NestedNavRow';
import SwitchRow from '../common/SwitchRow';
import ZulipTextIntl from '../common/ZulipTextIntl';
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
  navigation: MainTabsNavigationProp<'settings'>,
  route: RouteProp<'settings', void>,
|}>;

export default function SettingsScreen(props: Props): Node {
  const theme = useGlobalSelector(state => getGlobalSettings(state).theme);
  const browser = useGlobalSelector(state => getGlobalSettings(state).browser);
  const shouldMarkAsReadOnScroll = useGlobalSelector(
    state => getGlobalSettings(state).shouldMarkAsReadOnScroll,
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
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          alignContent: 'space-around',
          flexWrap: 'wrap',
          paddingLeft: 15,
        }}
      >
        <ZulipTextIntl
          style={{ fontSize: 15, alignSelf: 'center' }}
          text="Mark as read on scroll"
        />
        <Picker
          selectedValue={shouldMarkAsReadOnScroll}
          onValueChange={(itemValue, itemIndex) => {
            dispatch(setGlobalSettings({ shouldMarkAsReadOnScroll: itemValue }));
          }}
          style={{ height: '100%', width: '50%' }}
        >
          <Picker.Item label="Always" value="always" />
          <Picker.Item label="Conversation" value="conversation" />
          <Picker.Item label="Never" value="never" />
        </Picker>
      </View>

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
