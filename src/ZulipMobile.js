/* @flow */
import React, { Component } from 'react';
import { Provider } from 'react-redux';
import crashlytics from 'react-native-fabric-crashlytics';
import '../vendor/intl/intl';
import store, { restore } from './store';
import Providers from './Providers';

require('./i18n/locale');

crashlytics.init();

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
