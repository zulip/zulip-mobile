/* @flow */
import React, { PureComponent } from 'react';
import { Text } from 'react-native';
import { connect } from 'react-redux';
import { IntlProvider } from 'react-intl';

import type { ThemeType } from './types';
import '../vendor/intl/intl';
import messages from './i18n/messages';
import StylesProvider from './StylesProvider';
import AppContainer from './nav/AppContainer';
import { getLocale, getTheme } from './selectors';

require('./i18n/locale');

class Providers extends PureComponent {
  props: {
    locale: string,
    theme: ThemeType,
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
  locale: getLocale(state),
  theme: getTheme(state),
}))(Providers);
