/* @flow */
import React, { PureComponent } from 'react';
import { Text } from 'react-native';
import { connect } from 'react-redux';
import { IntlProvider } from 'react-intl';

import '../../vendor/intl/intl';
import messages from '../i18n/messages';

require('../i18n/locale');

type Props = {
  locale: string,
  children?: any,
};

class TranslationProvider extends PureComponent<Props> {
  render() {
    const { locale, children } = this.props;

    return (
      <IntlProvider key={locale} locale={locale} textComponent={Text} messages={messages[locale]}>
        {children}
      </IntlProvider>
    );
  }
}

export default connect(state => ({
  locale: state.settings.locale,
}))(TranslationProvider);
