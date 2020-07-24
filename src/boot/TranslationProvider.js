/* @flow strict-local */
import React, { PureComponent, Component } from 'react';
import type { ComponentType, ElementConfig, Node as React$Node } from 'react';
import { Text } from 'react-native';
import { IntlProvider } from 'react-intl';
import type { IntlShape } from 'react-intl';

import type { GetText, Dispatch } from '../types';
import { connect } from '../react-redux';
import { getSettings } from '../selectors';
import '../../vendor/intl/intl';
import messages from '../i18n/messages';

import '../i18n/locale';

// $FlowFixMe could put a well-typed mock value here, to help write tests
export const TranslationContext = React.createContext(undefined);

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
  const _ = value => intl.formatMessage({ id: value });
  _.intl = intl;
  return _;
};

/**
 * Consume the old-API context from IntlProvider, and provide a new-API context.
 *
 * This consumes the context provided by react-intl through React's
 * "legacy context API" from before 16.3, and provides a context through the
 * new API.
 *
 * See https://reactjs.org/docs/context.html
 * vs. https://reactjs.org/docs/legacy-context.html.
 *
 * Why do we need this? `IntlProvider` uses React's "legacy context
 * API", deprecated since React 16.3, of which the docs say:
 *
 *   ## Updating Context
 *
 *   Don't do it.
 *
 *   React has an API to update context, but it is fundamentally
 *   broken and you should not use it.
 *
 * It's broken because a consumer in the old way would never
 * re-`render` on changes to the context if they, or any of their
 * ancestors below the provider, implemented `shouldComponentUpdate`
 * in a way that blocked updates from the context. This meant that
 * neither the provider nor the consumer had the power to fix many
 * non-re-`render`ing bugs. A very common context-update-blocking
 * implementation of `shouldComponentUpdate` is the one
 * `PureComponent` uses, so the effect is widespread.
 *
 * In the new way, `shouldComponentUpdate`s (as implemented by hand or
 * by using `PureComponent`) in the hierarchy all the way down to the
 * consumer (inclusive) are ignored when the context updates.
 *
 * Consumers should consume `TranslationContext` as it's provided
 * here, so they don't have to worry about not updating when it
 * changes.
 */
// This component MUST NOT be a `PureComponent`; see above.
class TranslationContextTranslator extends Component<{|
  +children: React$Node,
|}> {
  context: { intl: IntlShape };

  static contextTypes = {
    intl: () => null,
  };

  render() {
    return (
      <TranslationContext.Provider value={makeGetText(this.context.intl)}>
        {this.props.children}
      </TranslationContext.Provider>
    );
  }
}

type Props = $ReadOnly<{|
  dispatch: Dispatch,
  locale: string,
  children: React$Node,
|}>;

class TranslationProvider extends PureComponent<Props> {
  render() {
    const { locale, children } = this.props;

    return (
      <IntlProvider locale={locale} textComponent={Text} messages={messages[locale]}>
        <TranslationContextTranslator>{children}</TranslationContextTranslator>
      </IntlProvider>
    );
  }
}

export default connect(state => ({
  locale: getSettings(state).locale,
}))(TranslationProvider);
