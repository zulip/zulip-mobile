import 'intl';
import React, { Component } from 'react';
import { Text } from 'react-native';
import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl';

import store, { restore } from './store';
import messages from './i18n/messages';
import LoadingScreen from './start/LoadingScreen';
import NavigationContainer from './nav/NavigationContainer';

require('./i18n/locale');

export default class ZulipMobile extends Component {

  state = {
    rehydrated: false,
  };

  componentWillMount() {
    restore(() => {
      this.setState({ rehydrated: true });
    });
  }

  render() {
    if (!this.state.rehydrated) {
      return <LoadingScreen />;
    }

    const { locale } = store.getState().settings;

    return (
      <Provider store={store}>
        <IntlProvider
          key={locale}
          locale={locale}
          textComponent={Text}
          messages={messages[locale]}
        >
          <NavigationContainer />
        </IntlProvider>
      </Provider>
    );
  }
}
