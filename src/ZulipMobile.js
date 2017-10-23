/* @flow */
import React from 'react';
import { Sentry } from 'react-native-sentry';

import '../vendor/intl/intl';
import config from './config';
import StoreProvider from './boot/StoreProvider';
import TranslationProvider from './boot/TranslationProvider';
import StylesProvider from './boot/StylesProvider';
import CompatibilityChecker from './boot/CompatibilityChecker';
import AppEventHandlers from './boot/AppEventHandlers';
import AppDataFetcher from './boot/AppDataFetcher';
import AppWithNavigationState from './nav/AppWithNavigationState';

require('./i18n/locale');

// console.disableYellowBox = true; // eslint-disable-line

if (config.enableSentry) {
  Sentry.config(config.sentryKey, { deactivateStacktraceMerging: true }).install();
}

export default () => (
  <CompatibilityChecker>
    <StoreProvider>
      <AppEventHandlers>
        <AppDataFetcher>
          <TranslationProvider>
            <StylesProvider>
              <AppWithNavigationState />
            </StylesProvider>
          </TranslationProvider>
        </AppDataFetcher>
      </AppEventHandlers>
    </StoreProvider>
  </CompatibilityChecker>
);
