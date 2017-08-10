/* @flow */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, View } from 'react-native';

import { Actions } from '../types';
import { Screen } from '../common';
import AlertWordsContainer from '../alertWords/AlertWordsContainer';
import LanguagePicker from './LanguagePicker';
import boundActions from '../boundActions';
import { getAuth } from '../selectors';

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
  },
});

class SettingsDetailScreen extends PureComponent {
  props: {
    actions: Actions,
    locale: string,
    navigation: {
      state: {
        params: {
          setting: string,
          title: string,
        },
      },
    },
  };

  handleLocaleChange = (value: string) => {
    this.props.actions.settingsChange('locale', value);
  };

  renderSettings = (setting: string) => {
    const { locale } = this.props;
    switch (setting) {
      case 'language': {
        return <LanguagePicker value={locale} onValueChange={this.handleLocaleChange} />;
      }
      case 'alertWords': {
        return <AlertWordsContainer />;
      }
      default:
        return null;
    }
  };

  render() {
    const { title, setting } = this.props.navigation.state.params;
    return (
      <Screen title={title}>
        <View style={styles.optionWrapper}>
          {this.renderSettings(setting)}
        </View>
      </Screen>
    );
  }
}

export default connect(
  state => ({
    offlineNotification: state.settings.offlineNotification,
    onlineNotification: state.settings.onlineNotification,
    locale: state.settings.locale,
    theme: state.settings.theme,
    auth: getAuth(state),
  }),
  boundActions,
)(SettingsDetailScreen);
