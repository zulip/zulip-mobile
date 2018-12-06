/* @flow strict-local */
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
  children: ChildrenArray<*>,
};

class TranslationProvider extends PureComponent<Props> {
  props: Props;

  render() {
    const { locale, children } = this.props;

    return (
      /* `IntlProvider` uses React's "legacy context API", deprecated since
       * React 16.3, of which the docs say:
       *
       *   ## Updating Context
       *
       *   Don't do it.
       *
       *   React has an API to update context, but it is fundamentally
       *   broken and you should not use it.
       *
       * To work around that, we set `key={locale}` to force the whole tree
       * to rerender if the locale changes.  Not cheap, but the locale
       * changing is rare.
       */
      <IntlProvider key={locale} locale={locale} textComponent={Text} messages={messages[locale]}>
        {children}
      </IntlProvider>
    );
  }
}

export default connect((state: GlobalState) => ({
  locale: getSettings(state).locale,
}))(TranslationProvider);
