/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import { Auth, Actions } from '../types';
import { WebLink } from '../common';
import toggleMobilePushSettings from '../api/toggleMobilePushSettings';
import OptionRow from './OptionRow';
import OptionButton from './OptionButton';

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
});

export default class SettingsCard extends PureComponent {
  props: {
    auth: Auth,
    actions: Actions,
    theme: string,
    offlineNotification: boolean,
    onlineNotification: boolean,
  };

  state: {
    filter: string,
  };

  handleThemeChange = () => {
    const { actions, theme } = this.props;
    actions.settingsChange('theme', theme === 'default' ? 'night' : 'default');
  };

  handleOfflineNotificationChange = () => {
    const { actions, auth, offlineNotification } = this.props;
    toggleMobilePushSettings({ auth, offline: !offlineNotification });
    actions.settingsChange('offlineNotification', !offlineNotification);
  };

  handleOnlineNotificationChange = () => {
    const { actions, auth, onlineNotification } = this.props;
    toggleMobilePushSettings({ auth, online: !onlineNotification });
    actions.settingsChange('onlineNotification', !onlineNotification);
  };

  render() {
    const { offlineNotification, onlineNotification, theme, actions } = this.props;

    return (
      <View style={styles.optionWrapper}>
        <OptionRow
          label="Notifications when offline"
          defaultValue={offlineNotification}
          onValueChange={this.handleOfflineNotificationChange}
        />
        <OptionRow
          label="Notifications when online"
          defaultValue={onlineNotification}
          onValueChange={this.handleOnlineNotificationChange}
        />
        <OptionRow
          label="Night mode"
          defaultValue={theme === 'night'}
          onValueChange={this.handleThemeChange}
        />
        <View style={styles.divider} />
        <OptionButton label="Language" onPress={actions.navigateToLanguage} />
        <View style={styles.divider} />
        <OptionButton label="Diagnostics" onPress={actions.navigateToDiagnostics} />
        <View style={styles.divider} />
        <OptionButton label="Timing" onPress={actions.navigateToTiming} />
        <View style={styles.padding}>
          <WebLink label="Terms of service" href="/terms/" />
          <WebLink label="Privacy policy" href="/privacy/" />
        </View>
      </View>
    );
  }
}
