/* @flow strict-local */

import React, { PureComponent } from 'react';
import { StyleSheet, ScrollView } from 'react-native';

import type { Dispatch } from '../types';
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
import {
  settingsChange,
  navigateToNotifications,
  navigateToLanguage,
  navigateToDiagnostics,
  navigateToLegal,
} from '../actions';

const styles = StyleSheet.create({
  optionWrapper: {
    flex: 1,
  },
});

type Props = {|
  theme: string,
  dispatch: Dispatch,
|};

class SettingsCard extends PureComponent<Props> {
  handleThemeChange = () => {
    const { dispatch, theme } = this.props;
    dispatch(settingsChange({ theme: theme === 'default' ? 'night' : 'default' }));
  };

  render() {
    const { theme, dispatch } = this.props;

    return (
      <ScrollView style={styles.optionWrapper}>
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
      </ScrollView>
    );
  }
}

export default connect(state => ({
  theme: getSettings(state).theme,
}))(SettingsCard);
