/* @flow strict-local */

import React, { PureComponent } from 'react';
import { ScrollView } from 'react-native';

import type { RouteProp } from '../react-navigation';
import type { MainTabsNavigationProp } from '../main/MainTabsScreen';
import * as NavigationService from '../nav/NavigationService';
import { createStyleSheet } from '../styles';
import { OptionButton } from '../common';
import {
  IconDiagnostics,
  IconNotifications,
  IconNight,
  IconLanguage,
  IconMoreHorizontal,
} from '../common/Icons';
import {
  navigateToThemeScreen,
  navigateToNotifications,
  navigateToLanguage,
  navigateToDiagnostics,
  navigateToLegal,
} from '../actions';

const styles = createStyleSheet({
  optionWrapper: {
    flex: 1,
  },
});

type Props = $ReadOnly<{|
  navigation: MainTabsNavigationProp<'settings'>,
  route: RouteProp<'settings', void>,
|}>;

class SettingsScreen extends PureComponent<Props> {
  render() {
    return (
      <ScrollView style={styles.optionWrapper}>
        <OptionButton
          Icon={IconNight}
          label="Theme"
          onPress={() => {
            NavigationService.dispatch(navigateToThemeScreen());
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
}

export default SettingsScreen;
