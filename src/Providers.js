import React, { Component } from 'react';
import { Text } from 'react-native';
import { connect } from 'react-redux';
import { IntlProvider } from 'react-intl';

import '../vendor/intl/intl';
import messages from './i18n/messages';
import AppContainer from './nav/AppContainer';

require('./i18n/locale');

class Providers extends Component {
  render() {
    const { locale } = this.props;

    return (
      <IntlProvider
        key={locale}
        locale={locale}
        textComponent={Text}
        messages={messages[locale]}
      >
        <AppContainer />
      </IntlProvider>
    );
  }
}

export default connect(
  (state) => ({
    locale: state.settings.locale,
    theme: state.settings.theme,
  }),
)(Providers);
