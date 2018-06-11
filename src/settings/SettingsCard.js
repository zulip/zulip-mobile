/* @flow */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';

import type { Context, Dispatch } from '../types';
import { getSettings } from '../selectors';
import { OptionButton, OptionDivider, OptionRow, WebLink } from '../common';
import SwitchAccountButton from '../account-info/SwitchAccountButton';
import LogoutButton from '../account-info/LogoutButton';
import { IconDiagnostics, IconNotifications, IconNight, IconLanguage } from '../common/Icons';
import {
  settingsChange,
  navigateToNotifications,
  navigateToLanguage,
  navigateToDiagnostics,
} from '../actions';

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
  theme: string,
  dispatch: Dispatch,
};

class SettingsCard extends PureComponent<Props> {
  context: Context;
  props: Props;

  static contextTypes = {
    styles: () => null,
  };

  handleThemeChange = () => {
    const { dispatch, theme } = this.props;
    dispatch(settingsChange('theme', theme === 'default' ? 'night' : 'default'));
  };

  render() {
    const { styles } = this.context;
    const { theme, dispatch } = this.props;

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
          onPress={() => {
            dispatch(navigateToNotifications);
          }}
        />
        <OptionButton
          Icon={IconLanguage}
          label="Language"
          onPress={() => {
            dispatch(navigateToLanguage);
          }}
        />
        <OptionButton
          Icon={IconDiagnostics}
          label="Diagnostics"
          onPress={() => {
            dispatch(navigateToDiagnostics);
          }}
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

export default connect(state => ({
  theme: getSettings(state).theme,
}))(SettingsCard);
