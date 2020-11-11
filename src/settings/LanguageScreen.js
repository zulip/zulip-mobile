/* @flow strict-local */

import React, { PureComponent } from 'react';

import type { AppNavigationProp, AppNavigationRouteProp } from '../nav/AppNavigator';
import type { Dispatch } from '../types';
import { connect } from '../react-redux';
import { Screen } from '../common';
import LanguagePicker from './LanguagePicker';
import { getSettings } from '../selectors';
import { settingsChange } from '../actions';

type Props = $ReadOnly<{|
  navigation: AppNavigationProp<'language'>,
  route: AppNavigationRouteProp<'language'>,

  dispatch: Dispatch,
  locale: string,
|}>;

type State = {|
  filter: string,
|};

class LanguageScreen extends PureComponent<Props, State> {
  state = {
    filter: '',
  };

  handleLocaleChange = (value: string) => {
    const { dispatch } = this.props;
    dispatch(settingsChange({ locale: value }));
  };

  handleFilterChange = (filter: string) => this.setState({ filter });

  render() {
    const { locale } = this.props;
    const { filter } = this.state;

    return (
      <Screen search searchBarOnChange={this.handleFilterChange} scrollEnabled={false}>
        <LanguagePicker value={locale} onValueChange={this.handleLocaleChange} filter={filter} />
      </Screen>
    );
  }
}

export default connect(state => ({
  locale: getSettings(state).locale,
}))(LanguageScreen);
