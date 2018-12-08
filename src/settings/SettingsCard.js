/* @flow strict-local */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';

import type { Dispatch, GlobalState } from '../types';
import { getSettings } from '../selectors';
import { OptionButton, OptionDivider, OptionRow } from '../common';
import SwitchAccountButton from '../account-info/SwitchAccountButton';
import LogoutButton from '../account-info/LogoutButton';
import {
  IconDiagnostics,
  IconNotifications,
  IconNight,
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

const componentStyles = StyleSheet.create({
  optionWrapper: {
    flex: 1,
  },
  accountButtons: {
    flex: 1,
    alignItems: 'flex-end',
    flexDirection: 'row',
    marginTop: 8,
  },
});

type Props = {
  theme: string,
  dispatch: Dispatch,
};

class SettingsCard extends PureComponent<Props> {
  props: Props;

  handleThemeChange = () => {
    const { dispatch, theme } = this.props;
    dispatch(settingsChange({ theme: theme === 'default' ? 'night' : 'default' }));
  };

  render() {
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
            dispatch(navigateToNotifications());
          }}
        />
        <OptionButton
          Icon={IconLanguage}
          label="Language"
          onPress={() => {
            dispatch(navigateToLanguage());
          }}
        />
        <OptionButton
          Icon={IconDiagnostics}
          label="Diagnostics"
          onPress={() => {
            dispatch(navigateToDiagnostics());
          }}
        />
        <OptionButton
          Icon={IconMoreHorizontal}
          label="Legal"
          onPress={() => {
            dispatch(navigateToLegal());
          }}
        />
        <OptionDivider />
        <View style={componentStyles.accountButtons}>
          <SwitchAccountButton />
          <LogoutButton />
        </View>
      </ScrollView>
    );
  }
}

export default connect((state: GlobalState) => ({
  theme: getSettings(state).theme,
}))(SettingsCard);
