/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';

import { Auth, Actions } from '../types';
import { WebLink } from '../common';
import { toggleMobilePushSettings } from '../api';
import OptionRow from './OptionRow';
import OptionButton from './OptionButton';
import SwitchAccountButton from '../account-info/SwitchAccountButton';
import LogoutButton from '../account-info/LogoutButton';

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
  offlineNotification: boolean,
  onlineNotification: boolean,
};

type State = {
  filter: string,
};

export default class SettingsCard extends PureComponent<Props, State> {
  props: Props;

  state: State;

  handleThemeChange = () => {
    const { actions, theme } = this.props;
    actions.settingsChange('theme', theme === 'default' ? 'night' : 'default');
  };

  handleOfflineNotificationChange = () => {
    const { actions, auth, offlineNotification } = this.props;
    toggleMobilePushSettings({
      auth,
      opp: 'offline_notification_change',
      value: !offlineNotification,
    });
    actions.settingsChange('offlineNotification', !offlineNotification);
  };

  handleOnlineNotificationChange = () => {
    const { actions, auth, onlineNotification } = this.props;
    toggleMobilePushSettings({
      auth,
      opp: 'online_notification_change',
      value: !onlineNotification,
    });
    actions.settingsChange('onlineNotification', !onlineNotification);
  };

  render() {
    const { offlineNotification, onlineNotification, theme, actions } = this.props;

    return (
      <ScrollView style={styles.optionWrapper}>
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
