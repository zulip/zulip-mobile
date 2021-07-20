/* @flow strict-local */
import React, { PureComponent, type Context } from 'react';
import type { ComponentType, ElementConfig, Node as React$Node } from 'react';
import { Text } from 'react-native';
import { IntlProvider, IntlContext } from 'react-intl';
import type { IntlShape } from 'react-intl';

import type { GetText } from '../types';
import { useSelector } from '../react-redux';
import { getSettings } from '../selectors';
import messages from '../i18n/messages';

// $FlowFixMe[incompatible-type] could put a well-typed mock value here, to help write tests
export const TranslationContext: Context<GetText> = React.createContext(undefined);

/**
 * Provide `_` to the wrapped component, passing other props through.
 *
 * This is useful when the component is already using its `context` property
 * for the legacy context API.  When that isn't the case, simply saying
 * `context: TranslationContext` may be more convenient.
 */
export function withGetText<P: { +_: GetText, ... }, C: ComponentType<P>>(
  WrappedComponent: C,
): ComponentType<$ReadOnly<$Exact<$Diff<ElementConfig<C>, {| _: GetText |}>>>> {
  return class extends React.Component<$Exact<$Diff<ElementConfig<C>, {| _: GetText |}>>> {
    render() {
      return (
        <TranslationContext.Consumer>
          {_ => <WrappedComponent _={_} {...this.props} />}
        </TranslationContext.Consumer>
      );
    }
  };
}

const makeGetText = (intl: IntlShape): GetText => {
  const _ = (message, values) =>
    intl.formatMessage(
      {
        id: message,

        // If you see this in dev, it means there's a user-facing
        // string that hasn't been added to
        // static/translations/messages_en.json. Please add it! :)
        defaultMessage:
          process.env.NODE_ENV === 'development' ? `UNTRANSLATED—${message}—UNTRANSLATED` : message,
      },
      values,
    );
  _.intl = intl;
  return _;
};

/**
 * Consume IntlProvider's context, and provide it in a different shape.
 *
 * See the `GetTypes` type for why we like the new shape.
 */
class TranslationContextTranslator extends PureComponent<{|
  +children: React$Node,
|}> {
  static contextType = IntlContext;
  context: IntlShape;

  render() {
    return (
      <TranslationContext.Provider value={makeGetText(this.context)}>
        {this.props.children}
      </TranslationContext.Provider>
    );
  }
}

type Props = $ReadOnly<{|
  children: React$Node,
|}>;

export default function TranslationProvider(props: Props): React$Node {
  const { children } = props;
  const language = useSelector(state => getSettings(state).language);

  return (
    <IntlProvider locale={language} textComponent={Text} messages={messages[language]}>
      <TranslationContextTranslator>{children}</TranslationContextTranslator>
    </IntlProvider>
  );
}
