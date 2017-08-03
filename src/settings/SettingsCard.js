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
    backgroundColor: '#EFEEF3',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'white',
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

  handleThemeChange = (value: boolean) => {
    this.props.actions.settingsChange('theme', value ? 'night' : 'default');
  };

  handleOfflineNotificationChange = (value: boolean) => {
    toggleMobilePushSettings({ auth: this.props.auth, offline: value });
    this.props.actions.settingsChange('offlineNotification', value);
  };

  handleOnlineNotificationChange = (value: boolean) => {
    toggleMobilePushSettings({ auth: this.props.auth, online: value });
    this.props.actions.settingsChange('onlineNotification', value);
  };

  render() {
    const { offlineNotification, onlineNotification, theme, actions } = this.props;

    return (
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
            onValueChange={actions.navigateToSettingsDetail}
          />
        </View>
        <View style={styles.divider} />
        <Touchable onPress={() => actions.navigateToSettingsDetail('language', 'Language')}>
          <View style={styles.optionRow}>
            <Label style={styles.optionTitle} text="Language" />
            <IconRightIcon size={18} style={styles.rightIcon} />
          </View>
        </Touchable>
      </View>
    );
  }
}
