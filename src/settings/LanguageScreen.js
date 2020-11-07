/* @flow strict-local */

import React, { PureComponent } from 'react';

import type { AppNavigationProp } from '../nav/AppNavigator';
import type { Dispatch } from '../types';
import { connect } from '../react-redux';
import { Screen } from '../common';
import LanguagePicker from './LanguagePicker';
import { getSettings } from '../selectors';
import { settingsChange } from '../actions';

type Props = $ReadOnly<{|
  // Since we've put this screen in AppNavigator's route config, and
  // we don't invoke it without type-checking anywhere else (in fact,
  // we don't invoke it anywhere else at all), we know it gets the
  // `navigation` prop for free, with the particular shape for this
  // route.
  navigation: AppNavigationProp<'language'>,

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
