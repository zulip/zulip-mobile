/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';

import type { Actions, Context } from '../types';
import { getSettings } from '../selectors';
import connectWithActions from '../connectWithActions';
import { OptionButton, OptionDivider, OptionRow, WebLink } from '../common';
import SwitchAccountButton from '../account-info/SwitchAccountButton';
import LogoutButton from '../account-info/LogoutButton';
import { IconDiagnostics, IconNotifications, IconNight, IconLanguage } from '../common/Icons';

const componentStyles = StyleSheet.create({
  optionWrapper: {
    flex: 1,
  },
  accountButtons: {
    flex: 1,
    alignItems: 'flex-end',
    flexDirection: 'row',
  },
});

type Props = {
  actions: Actions,
  theme: string,
};

class SettingsCard extends PureComponent<Props> {
  context: Context;
  props: Props;

  static contextTypes = {
    styles: () => null,
  };

  handleThemeChange = () => {
    const { actions, theme } = this.props;
    actions.settingsChange('theme', theme === 'default' ? 'night' : 'default');
  };

  render() {
    const { styles } = this.context;
    const { theme, actions } = this.props;

    return (
      <ScrollView style={componentStyles.optionWrapper}>
        <OptionRow
          Icon={IconNight}
          label="Night mode"
          defaultValue={theme === 'night'}
          onValueChange={this.handleThemeChange}
        />
        <OptionButton
          Icon={IconNotifications}
          label="Notifications"
          onPress={actions.navigateToNotifications}
        />
        <OptionButton Icon={IconLanguage} label="Language" onPress={actions.navigateToLanguage} />
        <OptionButton
          Icon={IconDiagnostics}
          label="Diagnostics"
          onPress={actions.navigateToDiagnostics}
        />
        <OptionDivider />
        <View style={styles.padding}>
          <WebLink label="Terms of service" href="/terms/" />
          <WebLink label="Privacy policy" href="/privacy/" />
        </View>
        <View style={componentStyles.accountButtons}>
          <SwitchAccountButton />
          <LogoutButton />
        </View>
      </ScrollView>
    );
  }
}

export default connectWithActions(state => ({
  theme: getSettings(state).theme,
}))(SettingsCard);
