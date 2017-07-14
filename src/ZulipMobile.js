/* @flow */
import React, { Component } from 'react';
import { Provider } from 'react-redux';
// import { Sentry } from 'react-native-sentry';
import '../vendor/intl/intl';
import store, { restore } from './store';
import Providers from './Providers';

require('./i18n/locale');

// Sentry.config(SENTRY-KEY-HERE).install();

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
