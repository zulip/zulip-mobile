/* @flow strict-local */

import React, { PureComponent } from 'react';
import { ScrollView } from 'react-native';
import type { NavigationTabProp, NavigationStateRoute } from 'react-navigation-tabs';

import NavigationService from '../nav/NavigationService';
import type { Dispatch } from '../types';
import { createStyleSheet } from '../styles';
import { connect } from '../react-redux';
import { getSettings } from '../selectors';
import { OptionButton, OptionRow } from '../common';
import {
  IconDiagnostics,
  IconNotifications,
  IconNight,
  IconLanguage,
  IconMoreHorizontal,
} from '../common/Icons';
import ModalNavBar from '../nav/ModalNavBar';
import {
  settingsChange,
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
  // Since we've put this screen in a tab-nav route config, and we
  // don't invoke it without type-checking anywhere else (in fact, we
  // don't invoke it anywhere else at all), we know it gets the
  // `navigation` prop for free, with the tab-nav shape.
  navigation: NavigationTabProp<NavigationStateRoute>,

  theme: string,
  dispatch: Dispatch,
|}>;

class SettingsCard extends PureComponent<Props> {
  handleThemeChange = () => {
    const { dispatch, theme } = this.props;
    dispatch(settingsChange({ theme: theme === 'default' ? 'night' : 'default' }));
  };

  render() {
    const { theme } = this.props;

    return (
      <ScrollView style={styles.optionWrapper}>
        <ModalNavBar canGoBack={false} title="Settings" />
        <OptionRow
          Icon={IconNight}
          label="Night mode"
          value={theme === 'night'}
          onValueChange={this.handleThemeChange}
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

export default connect(state => ({
  theme: getSettings(state).theme,
}))(SettingsCard);
