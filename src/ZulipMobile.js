/* @flow */
import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { Sentry } from 'react-native-sentry';

import '../vendor/intl/intl';
import store, { restore } from './store';
import Providers from './Providers';
import config from './config';

require('./i18n/locale');

if (config.enableSentry) {
  Sentry.config(config.sentryKey).install();
}

export default class ZulipMobile extends Component {
  componentWillMount() {
    restore();
  }

  render() {
    return (
      <Provider store={store}>
        <Providers />
      </Provider>
    );
  }
}
