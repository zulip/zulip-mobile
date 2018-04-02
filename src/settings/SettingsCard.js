/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';

import type { Auth, Actions } from '../types';
import { getAuth, getSettings } from '../selectors';
import connectWithActions from '../connectWithActions';
import { OptionButton, OptionRow, WebLink } from '../common';
import SwitchAccountButton from '../account-info/SwitchAccountButton';
import LogoutButton from '../account-info/LogoutButton';
import { IconDiagnostics, IconNotifications, IconNight, IconLanguage } from '../common/Icons';

const styles = StyleSheet.create({
  optionWrapper: {
    flex: 1,
  },
  divider: {
    height: 16,
  },
  padding: {
    padding: 16,
  },
  accountButtons: {
    flex: 1,
    alignItems: 'flex-end',
    flexDirection: 'row',
  },
});

type Props = {
  auth: Auth,
  actions: Actions,
  theme: string,
};

class SettingsCard extends PureComponent<Props> {
  props: Props;

  handleThemeChange = () => {
    const { actions, theme } = this.props;
    actions.settingsChange('theme', theme === 'default' ? 'night' : 'default');
  };

  render() {
    const { theme, actions } = this.props;

    return (
      <ScrollView style={styles.optionWrapper}>
        <View style={styles.divider} />
        <OptionRow
          Icon={IconNight}
          label="Night mode"
          defaultValue={theme === 'night'}
          onValueChange={this.handleThemeChange}
        />
        <View style={styles.divider} />
        <OptionButton
          Icon={IconNotifications}
          label="Notifications"
          onPress={actions.navigateToNotifications}
        />
        <View style={styles.divider} />
        <OptionButton Icon={IconLanguage} label="Language" onPress={actions.navigateToLanguage} />
        <View style={styles.divider} />
        <OptionButton
          Icon={IconDiagnostics}
          label="Diagnostics"
          onPress={actions.navigateToDiagnostics}
        />
        <View style={styles.padding}>
          <WebLink label="Terms of service" href="/terms/" />
          <WebLink label="Privacy policy" href="/privacy/" />
        </View>
        <View style={styles.accountButtons}>
          <SwitchAccountButton />
          <LogoutButton />
        </View>
      </ScrollView>
    );
  }
}

export default connectWithActions(state => ({
  auth: getAuth(state),
  theme: getSettings(state).theme,
}))(SettingsCard);
