/* @flow strict-local */
import * as React from 'react';
import { Text } from 'react-native';
import { IntlProvider, IntlContext } from 'react-intl';
import type { IntlShape } from 'react-intl';

import type { GetText } from '../types';
import { useGlobalSelector } from '../react-redux';
import { getGlobalSettings } from '../selectors';
import messagesByLanguage from '../i18n/messagesByLanguage';
import { getZulipFeatureLevel, tryGetActiveAccountState } from '../account/accountsSelectors';
import { objectFromEntries } from '../jsBackport';
import { objectEntries } from '../flowPonyfill';
import {
  streamChannelRenameFeatureLevel,
  streamChannelRenamesMap,
} from './streamChannelRenamesMap';
import { getHaveServerData } from '../haveServerDataSelectors';

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

/**
 * Like messagesByLanguage but with "channel" terminology instead of "stream".
 */
const messagesByLanguageRenamed = objectFromEntries(
  objectEntries(messagesByLanguage).map(([language, messages]) => [
    language,
    objectFromEntries(
      objectEntries(messages).map(([messageId, message]) => {
        const renamedMessageId = streamChannelRenamesMap[messageId];
        if (renamedMessageId == null) {
          return [messageId, message];
        }

        const renamedMessage = messages[renamedMessageId];
        if (renamedMessage === renamedMessageId && message !== messageId) {
          // The newfangled "channel" string hasn't been translated yet, but
          // the older "stream" string has.  Consider falling back to that.
          if (/^en($|-)/.test(language)) {
            // The language is a variety of English.  Prefer the newer
            // terminology, even though awaiting translation.  (Most of our
            // strings don't change at all between one English and another.)
            return [messageId, renamedMessage];
          }
          // Use the translation we have, even of the older terminology.
          // (In many languages the translations have used an equivalent
          // of "channel" all along anyway.)
          return [messageId, message];
        }
        return [messageId, renamedMessage];
      }),
    ),
  ]),
);

export default function TranslationProvider(props: Props): React.Node {
  const { children } = props;
  const language = useGlobalSelector(state => getGlobalSettings(state).language);

  const activeAccountState = useGlobalSelector(tryGetActiveAccountState);

  // TODO(server-9.0) remove "stream" terminology
  const effectiveMessagesByLanguage =
    activeAccountState == null
    || !getHaveServerData(activeAccountState)
    || getZulipFeatureLevel(activeAccountState) >= streamChannelRenameFeatureLevel
      ? messagesByLanguageRenamed
      : messagesByLanguage;

  return (
    <IntlProvider
      locale={language}
      textComponent={Text}
      messages={effectiveMessagesByLanguage[language]}
    >
      <TranslationContextTranslator>{children}</TranslationContextTranslator>
    </IntlProvider>
  );
}
