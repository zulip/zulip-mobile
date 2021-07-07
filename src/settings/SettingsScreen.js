/* @flow strict-local */

import React, { useCallback } from 'react';
import { ScrollView } from 'react-native';

import type { RouteProp } from '../react-navigation';
import type { MainTabsNavigationProp } from '../main/MainTabsScreen';
import * as NavigationService from '../nav/NavigationService';
import type { Dispatch, BrowserPreference } from '../types';
import { createStyleSheet } from '../styles';
import { connect } from '../react-redux';
import { getSettings } from '../selectors';
import { OptionButton, OptionRow } from '../common';
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

  theme: string,
  browser: BrowserPreference,
  dispatch: Dispatch,
|}>;

function SettingsScreen(props: Props) {
  const { dispatch, theme, browser } = props;

  const handleThemeChange = useCallback(() => {
    dispatch(settingsChange({ theme: theme === 'default' ? 'night' : 'default' }));
  }, [theme, dispatch]);

  return (
    <ScrollView style={styles.optionWrapper}>
      <OptionRow label="Night mode" value={theme === 'night'} onValueChange={handleThemeChange} />
      <OptionRow
        label="Open links with in-app browser"
        value={shouldUseInAppBrowser(browser)}
        onValueChange={value => {
          dispatch(settingsChange({ browser: value ? 'embedded' : 'external' }));
        }}
      />
      <OptionButton
        Icon={IconNotifications}
        label="Notifications"
        onPress={() => {
          NavigationService.dispatch(navigateToNotifications());
        }}
      />
      <OptionButton
        Icon={IconLanguage}
        label="Language"
        onPress={() => {
          NavigationService.dispatch(navigateToLanguage());
        }}
      />
      <OptionButton
        Icon={IconDiagnostics}
        label="Diagnostics"
        onPress={() => {
          NavigationService.dispatch(navigateToDiagnostics());
        }}
      />
      <OptionButton
        Icon={IconMoreHorizontal}
        label="Legal"
        onPress={() => {
          NavigationService.dispatch(navigateToLegal());
        }}
      />
    </ScrollView>
  );
}

export default connect(state => ({
  theme: getSettings(state).theme,
  browser: getSettings(state).browser,
}))(SettingsScreen);
