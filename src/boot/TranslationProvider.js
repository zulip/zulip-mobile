/* @flow */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { Text } from 'react-native';
import { IntlProvider } from 'react-intl';

import type { ChildrenArray, GlobalState } from '../types';
import { getSettings } from '../selectors';
import '../../vendor/intl/intl';
import messages from '../i18n/messages';

import '../i18n/locale';

type Props = {
  locale: string,
  children?: ChildrenArray<*>,
};

class TranslationProvider extends PureComponent<Props> {
  props: Props;

  render() {
    const { locale, children } = this.props;

    return (
      <IntlProvider key={locale} locale={locale} textComponent={Text} messages={messages[locale]}>
        {children}
      </IntlProvider>
    );
  }
}

export default connect((state: GlobalState) => ({
  locale: getSettings(state).locale,
}))(TranslationProvider);
