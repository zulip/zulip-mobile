/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import { Auth, Actions } from '../types';
import { Label, ZulipSwitch, Touchable } from '../common';
import { IconRightIcon } from '../common/Icons';
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
    backgroundColor: 'rgba(127, 127, 127, 0.1)',
  },
  optionTitle: {
    padding: 6,
    paddingLeft: 0,
  },
  optionList: {
    flex: 1,
  },
  divider: {
    height: 30,
  },
  rightIcon: {
    marginRight: 6,
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
        <View style={styles.optionRow}>
          <Label text="Notifications when offline" />
          <ZulipSwitch
            defaultValue={offlineNotification}
            onValueChange={this.handleOfflineNotificationChange}
          />
        </View>
        <View style={styles.optionRow}>
          <Label text="Notifications when online" />
          <ZulipSwitch
            defaultValue={onlineNotification}
            onValueChange={this.handleOnlineNotificationChange}
          />
        </View>
        <View style={styles.optionRow}>
          <Label text="Night mode" />
          <ZulipSwitch defaultValue={theme === 'night'} onValueChange={this.handleThemeChange} />
        </View>
        <View style={styles.divider} />
        <Touchable onPress={() => actions.navigateToSettingsDetail('language', 'Language')}>
          <View style={styles.optionRow}>
            <Label style={styles.optionTitle} text="Language" />
            <IconRightIcon size={18} style={styles.rightIcon} />
          </View>
        </Touchable>
        <View style={styles.divider} />
        <Touchable onPress={() => actions.navigateToSettingsDetail('alertWords', 'Alert Words')}>
          <View style={styles.optionRow}>
            <Label style={styles.optionTitle} text="Alert Words" />
            <IconRightIcon size={18} style={styles.rightIcon} />
          </View>
        </Touchable>
      </View>
    );
  }
}
