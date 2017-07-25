/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import { Auth, Actions } from '../types';
import { Label, ZulipSwitch, Touchable } from '../common';
import LanguagePicker from './LanguagePicker';
import toggleMobilePushSettings from '../api/toggleMobilePushSettings';
import openLink from '../utils/openLink';

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
  optionColumn: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  optionTitle: {
    padding: 8,
    fontWeight: 'bold',
  },
  optionSupport: {
    padding: 8,
  },
  optionList: {
    flex: 1,
  },
  linksTouchable: {
    alignItems: 'flex-start',
  },
});

export default class SettingsCard extends PureComponent {
  props: {
    auth: Auth,
    actions: Actions,
    theme: string,
    locale: string,
    offlineNotification: boolean,
    onlineNotification: boolean,
  };

  state: {
    filter: string,
  };

  handleLocaleChange = (value: string) => {
    this.props.actions.settingsChange('locale', value);
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
    const { offlineNotification, onlineNotification, theme, locale, auth } = this.props;
    const termsLink = `${auth.realm}/terms/`;
    const privacyLink = `${auth.realm}/privacy/`;

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
          <ZulipSwitch defaultValue={theme === 'night'} onValueChange={this.handleThemeChange} />
        </View>
        <View style={styles.optionList}>
          <Label style={styles.optionTitle} text="Language" />
          <LanguagePicker value={locale} onValueChange={this.handleLocaleChange} />
        </View>
        <View style={styles.optionColumn}>
          <Label style={styles.optionTitle} text="Support" />
          <View style={styles.linksTouchable}>
            <Touchable>
              <Label
                style={styles.optionSupport}
                text="Terms of service"
                onPress={() => openLink(termsLink)}
              />
            </Touchable>
            <Touchable>
              <Label
                style={styles.optionSupport}
                text="Privacy policy"
                onPress={() => openLink(privacyLink)}
              />
            </Touchable>
          </View>
        </View>
      </View>
    );
  }
}
