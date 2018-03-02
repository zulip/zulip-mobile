/* @flow */
import React from 'react';

import '../vendor/intl/intl';
import StoreProvider from './boot/StoreProvider';
import TranslationProvider from './boot/TranslationProvider';
import StylesProvider from './boot/StylesProvider';
import CompatibilityChecker from './boot/CompatibilityChecker';
import AppEventHandlers from './boot/AppEventHandlers';
import AppDataFetcher from './boot/AppDataFetcher';
import AppWithNavigationState from './nav/AppWithNavigationState';

require('./i18n/locale');
require('./sentry');

// $FlowFixMe
console.disableYellowBox = true; // eslint-disable-line

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
