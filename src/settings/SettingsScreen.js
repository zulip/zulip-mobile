/* @flow */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';

import type { Auth, Actions } from '../types';
import boundActions from '../boundActions';
import { Label, Screen, ZulipSwitch } from '../common';
import LanguagePicker from './LanguagePicker';
import { getAuth } from '../account/accountSelectors';
import toggleMobilePushSettings from '../api/toggleMobilePushSettings';

const styles = StyleSheet.create({
  optionWrapper: {
    flex: 1,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
  },
  optionTitle: {
    padding: 8,
    fontWeight: 'bold',
  },
  optionList: {
    flex: 1,
  }
});

class SettingsScreen extends React.Component {

  props: {
    auth: Auth,
    actions: Actions,
    notifications: boolean,
    theme: string,
    locale: string,
    offlineNotification: boolean,
    onlineNotification: boolean,
  };

  state: {
    filter: string,
  };

  handleLocaleChange = (value) => {
    this.props.actions.settingsChange('locale', value);
  };

  handleThemeChange = (value) => {
    this.props.actions.settingsChange('theme', value ? 'night' : 'default');
  };

  handleOfflineNotificationChange = (value) => {
    toggleMobilePushSettings({ auth: this.props.auth, offline: value });
    this.props.actions.settingsChange('offlineNotification', value);
  };

  handleOnlineNotificationChange = (value) => {
    toggleMobilePushSettings({ auth: this.props.auth, online: value });
    this.props.actions.settingsChange('onlineNotification', value);
  };

  render() {
    const { offlineNotification, onlineNotification, theme, locale } = this.props;

    return (
      <Screen title="Settings">
        <View style={styles.optionWrapper}>
          <View style={styles.optionRow}>
            <Label text="Enable notifications (when offline)" />
            <ZulipSwitch
              defaultValue={offlineNotification}
              onValueChange={this.handleOfflineNotificationChange}
            />
          </View>
          <View style={styles.optionRow}>
            <Label text="Enable notifications (when online)" />
            <ZulipSwitch
              defaultValue={onlineNotification}
              onValueChange={this.handleOnlineNotificationChange}
            />
          </View>
          <View style={styles.optionRow}>
            <Label text="Night mode" />
            <ZulipSwitch
              defaultValue={theme === 'night'}
              onValueChange={this.handleThemeChange}
            />
          </View>
          <View style={styles.optionList}>
            <Label style={styles.optionTitle} text="Language" />
            <LanguagePicker
              value={locale}
              onValueChange={this.handleLocaleChange}
            />
          </View>
        </View>
      </Screen>
    );
  }
}

export default connect(
  (state) => ({
    offlineNotification: state.settings.offlineNotification,
    onlineNotification: state.settings.onlineNotification,
    locale: state.settings.locale,
    theme: state.settings.theme,
    auth: getAuth(state),
  }),
  boundActions,
)(SettingsScreen);
