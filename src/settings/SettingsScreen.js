import React from 'react';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import { Label, Screen, ZulipSwitch } from '../common';
import LanguagePicker from './LanguagePicker';
import { getAuth } from '../account/accountSelectors';
import toggleOfflinePushNotifications from '../api/toggleOfflinePushNotifications';

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
    theme: string,
    locale: string,
  };

  state: {
    filter: string,
  };

  handleLocaleChange = (value) => {
    this.props.settingsChange('locale', value);
  };

  handleThemeChange = (value) => {
    this.props.settingsChange('theme', value ? 'night' : 'default');
  };

  handleNotificationChange = (value) => {
    toggleOfflinePushNotifications(this.props.auth, value);
    this.props.settingsChange('offlinePushNotification', value);
  };

  render() {
    const { offlinePushNotification, theme, locale } = this.props;
    return (
      <Screen title="Settings">
        <View style={styles.optionWrapper}>
          <View style={styles.optionRow}>
            <Label text="Enable notifications" />
            <ZulipSwitch
              defaultValue={offlinePushNotification}
              onValueChange={this.handleNotificationChange}
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
    offlinePushNotification: state.settings.offlinePushNotification,
    locale: state.settings.locale,
    theme: state.settings.theme,
    auth: getAuth(state),
  }),
  boundActions,
)(SettingsScreen);
