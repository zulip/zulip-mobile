/* @flow strict-local */
import * as React from 'react';
import { Text } from 'react-native';
import { IntlProvider, IntlContext } from 'react-intl';
import type { IntlShape } from 'react-intl';

import type { GetText } from '../types';
import { useGlobalSelector } from '../react-redux';
import { getGlobalSettings } from '../selectors';
import messages from '../i18n/messages';

// $FlowFixMe[incompatible-type] could put a well-typed mock value here, to help write tests
export const TranslationContext: React.Context<GetText> = React.createContext(undefined);

const makeGetText = (intl: IntlShape): GetText => {
  const _ = (message, values_) => {
    const text = typeof message === 'object' ? message.text : message;
    const values = typeof message === 'object' ? message.values : values_;

    return intl.formatMessage(
      {
        id: text,

        // If you see this in dev, it means there's a user-facing
        // string that hasn't been added to
        // static/translations/messages_en.json. Please add it! :)
        defaultMessage:
          process.env.NODE_ENV === 'development' ? `UNTRANSLATED—${text}—UNTRANSLATED` : text,
      },
      values,
    );
  };
  _.intl = intl;
  return _;
};

/**
 * Consume IntlProvider's context, and provide it in a different shape.
 *
 * See the `GetTypes` type for why we like the new shape.
 */
function TranslationContextTranslator(props: {| +children: React.Node |}): React.Node {
  const intlContextValue = React.useContext(IntlContext);

  return (
    <TranslationContext.Provider value={makeGetText(intlContextValue)}>
      {props.children}
    </TranslationContext.Provider>
  );
}

type Props = $ReadOnly<{|
  children: React.Node,
|}>;

export default function TranslationProvider(props: Props): React.Node {
  const { children } = props;
  const language = useGlobalSelector(state => getGlobalSettings(state).language);

  return (
    <IntlProvider locale={language} textComponent={Text} messages={messages[language]}>
      <TranslationContextTranslator>{children}</TranslationContextTranslator>
    </IntlProvider>
  );
}
