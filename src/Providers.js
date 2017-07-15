/* @flow */
import React, { PureComponent } from 'react';
import { Text } from 'react-native';
import { connect } from 'react-redux';
import { IntlProvider } from 'react-intl';

import '../vendor/intl/intl';
import messages from './i18n/messages';
import StylesProvider from './StylesProvider';
import AppContainer from './nav/AppContainer';

require('./i18n/locale');

class Providers extends PureComponent {
  props: {
    locale: string,
    theme: string,
  };

  render() {
    const { locale, theme } = this.props;

    return (
      <IntlProvider key={locale} locale={locale} textComponent={Text} messages={messages[locale]}>
        <StylesProvider key={theme} theme={theme}>
          <AppContainer />
        </StylesProvider>
      </IntlProvider>
    );
  }
}

export default connect(state => ({
  locale: state.settings.locale,
  theme: state.settings.theme,
}))(Providers);
