/* @flow */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import { Actions } from '../types';
import { Screen } from '../common';
import LanguagePicker from './LanguagePicker';
import boundActions from '../boundActions';

type Props = {
  actions: Actions,
  locale: string,
};

class LanguageScreen extends PureComponent<Props> {
  props: Props;

  handleLocaleChange = (value: string) => {
    const { actions } = this.props;
    actions.settingsChange('locale', value);
  };

  render() {
    const { locale } = this.props;

    return (
      <Screen title="Language">
        <LanguagePicker value={locale} onValueChange={this.handleLocaleChange} />
      </Screen>
    );
  }
}

export default connect(
  state => ({
    locale: state.settings.locale,
  }),
  boundActions,
)(LanguageScreen);
