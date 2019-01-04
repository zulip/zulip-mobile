/* @flow strict-local */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';

import type { Dispatch, GlobalState } from '../types';
import { Screen } from '../common';
import LanguagePicker from './LanguagePicker';
import { getSettings } from '../selectors';
import { settingsChange } from '../actions';

type Props = {|
  dispatch: Dispatch,
  locale: string,
|};

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

export default connect((state: GlobalState) => ({
  locale: getSettings(state).locale,
}))(LanguageScreen);
