import React from 'react';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import { Label, Screen, ZulipSwitch } from '../common';
import LanguagePicker from './LanguagePicker';

const styles = StyleSheet.create({
  optionWrapper: {
    flex: 1,
  },
/*  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
  }, */
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
    keyboardAvoiding: boolean,
    title: string,
    isSearchBarApplied: boolean,
    searchBar: boolean,
    searchBarOnChange: () => {}
  };

  state: {
    filter: string,
  };

  handleLocaleChange = (value) => {
    this.props.settingsChange('locale', value);
  };

  handleThemeChange = () => {};

  render() {
    const { locale, theme } = this.props;

    return (
      <Screen title="Settings">
        <View style={styles.optionWrapper}>
          {/* <View style={styles.optionRow}>
            <Label text="Night mode" />
            <ZulipSwitch
              defaultValue={theme === 'default'}
              onValueChange={this.handleThemeChange}
            />
          </View>*/ }
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
    locale: state.settings.locale,
    theme: state.settings.theme,
  }),
  boundActions,
)(SettingsScreen);
