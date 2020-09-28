/* @flow strict-local */
import React from 'react';
import 'react-native-url-polyfill/auto';

import StoreProvider from './boot/StoreProvider';
import TranslationProvider from './boot/TranslationProvider';
import ThemeProvider from './boot/ThemeProvider';
import CompatibilityChecker from './boot/CompatibilityChecker';
import AppEventHandlers from './boot/AppEventHandlers';
import AppDataFetcher from './boot/AppDataFetcher';
import BackNavigationHandler from './nav/BackNavigationHandler';
import InitialNavigationDispatcher from './nav/InitialNavigationDispatcher';
import AppContainer from './nav/AppContainer';
import NavigationService from './nav/NavigationService';

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
            <ThemeProvider>
              <InitialNavigationDispatcher>
                <BackNavigationHandler>
                  <AppContainer ref={NavigationService.appContainerRef} />
                </BackNavigationHandler>
              </InitialNavigationDispatcher>
            </ThemeProvider>
          </TranslationProvider>
        </AppDataFetcher>
      </AppEventHandlers>
    </StoreProvider>
  </CompatibilityChecker>
);
