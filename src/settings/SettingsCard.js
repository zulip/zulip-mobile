/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View, ScrollView, Text } from 'react-native';

import type { Auth, Actions } from '../types';
import { getAuth, getSettings } from '../selectors';
import connectWithActions from '../connectWithActions';
import { OptionButton, OptionRow, WebLink } from '../common';
import SwitchAccountButton from '../account-info/SwitchAccountButton';
import LogoutButton from '../account-info/LogoutButton';

const styles = StyleSheet.create({
  optionWrapper: {
    flex: 1,
    paddingTop: 20,
  },
  header: {
    color: 'black',
    fontSize: 40,
    textAlign: 'center',
  },
  headerNight: {
    color: 'white',
  },
  bigGap: {
    height: 30,
  },
  divider: {
    height: 10,
  },
  padding: {
    padding: 16,
  },
  accountButtons: {
    position: 'absolute',
    bottom: -150,
    flexDirection: 'row',
  },
});

type Props = {
  auth: Auth,
  actions: Actions,
  theme: string,
};

class SettingsCard extends PureComponent<Props> {
  props: Props;

  handleThemeChange = () => {
    const { actions, theme } = this.props;
    actions.settingsChange('theme', theme === 'default' ? 'night' : 'default');
  };

  render() {
    const { theme, actions } = this.props;

    return (
      <ScrollView style={styles.optionWrapper}>
        <Text style={[styles.header, theme === 'night' && styles.headerNight]}> Settings </Text>
        <View style={styles.bigGap} />
        <OptionRow
          label="Night mode"
          defaultValue={theme === 'night'}
          onValueChange={this.handleThemeChange}
        />
        <View style={styles.divider} />
        <OptionButton label="Notifications" onPress={actions.navigateToNotifications} />
        <View style={styles.divider} />
        <OptionButton label="Language" onPress={actions.navigateToLanguage} />
        <View style={styles.divider} />
        <OptionButton label="Diagnostics" onPress={actions.navigateToDiagnostics} />
        <View style={styles.padding}>
          <View style={styles.divider} />
          <WebLink label="Terms of service" href="/terms/" />
          <View style={styles.divider} />
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

export default connectWithActions(state => ({
  auth: getAuth(state),
  theme: getSettings(state).theme,
}))(SettingsCard);
