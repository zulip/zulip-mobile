/* @flow strict-local */
import React from 'react';
import 'react-native-url-polyfill/auto';

import '../vendor/intl/intl';
import StoreProvider from './boot/StoreProvider';
import TranslationProvider from './boot/TranslationProvider';
import StylesProvider from './boot/StylesProvider';
import CompatibilityChecker from './boot/CompatibilityChecker';
import AppEventHandlers from './boot/AppEventHandlers';
import AppDataFetcher from './boot/AppDataFetcher';
import BackNavigationHandler from './nav/BackNavigationHandler';
import AppWithNavigation from './nav/AppWithNavigation';

import './i18n/locale';
import { initializeSentry } from './sentry';

initializeSentry();

// $FlowFixMe
console.disableYellowBox = true; // eslint-disable-line

export default (): React$Node => (
  <CompatibilityChecker>
    <StoreProvider>
      <AppEventHandlers>
        <AppDataFetcher>
          <TranslationProvider>
            <StylesProvider>
              <BackNavigationHandler>
                <AppWithNavigation />
              </BackNavigationHandler>
            </StylesProvider>
          </TranslationProvider>
        </AppDataFetcher>
      </AppEventHandlers>
    </StoreProvider>
  </CompatibilityChecker>
);
