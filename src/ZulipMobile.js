/* @flow */
import React from 'react';
import { Sentry } from 'react-native-sentry';

import '../vendor/intl/intl';
import StoreHydrator from './StoreHydrator';
import config from './config';

require('./i18n/locale');

// console.disableYellowBox = true; // eslint-disable-line

if (config.enableSentry) {
  Sentry.config(config.sentryKey).install();
}

export default () => <StoreHydrator />;
