/* @flow strict-local */

import React, { useCallback } from 'react';
import { ScrollView } from 'react-native';

import type { RouteProp } from '../react-navigation';
import type { MainTabsNavigationProp } from '../main/MainTabsScreen';
import * as NavigationService from '../nav/NavigationService';
import { createStyleSheet } from '../styles';
import { useSelector, useDispatch } from '../react-redux';
import { getSettings } from '../selectors';
import { NestedNavRow, SwitchRow } from '../common';
import {
  IconDiagnostics,
  IconNotifications,
  IconLanguage,
  IconMoreHorizontal,
} from '../common/Icons';
import {
  settingsChange,
  navigateToNotifications,
  navigateToLanguage,
  navigateToDiagnostics,
  navigateToLegal,
} from '../actions';
import { shouldUseInAppBrowser } from '../utils/openLink';

const styles = createStyleSheet({
  optionWrapper: {
    flex: 1,
  },
});

type Props = $ReadOnly<{|
  navigation: MainTabsNavigationProp<'settings'>,
  route: RouteProp<'settings', void>,
|}>;

export default function SettingsScreen(props: Props) {
  const theme = useSelector(state => getSettings(state).theme);
  const browser = useSelector(state => getSettings(state).browser);
  const dispatch = useDispatch();

  const handleThemeChange = useCallback(() => {
    dispatch(settingsChange({ theme: theme === 'default' ? 'night' : 'default' }));
  }, [theme, dispatch]);

  return (
    <ScrollView style={styles.optionWrapper}>
      <SwitchRow label="Night mode" value={theme === 'night'} onValueChange={handleThemeChange} />
      <SwitchRow
        label="Open links with in-app browser"
        value={shouldUseInAppBrowser(browser)}
        onValueChange={value => {
          dispatch(settingsChange({ browser: value ? 'embedded' : 'external' }));
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
    </ScrollView>
  );
}
