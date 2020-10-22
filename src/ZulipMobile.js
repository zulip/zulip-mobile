/* @flow strict-local */
import React from 'react';
import 'react-native-url-polyfill/auto';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { BRAND_COLOR } from './styles';
import StoreProvider from './boot/StoreProvider';
import HideIfNotHydrated from './boot/HideIfNotHydrated';
import TranslationProvider from './boot/TranslationProvider';
import ThemeProvider from './boot/ThemeProvider';
import CompatibilityChecker from './boot/CompatibilityChecker';
import AppEventHandlers from './boot/AppEventHandlers';
import AppDataFetcher from './boot/AppDataFetcher';
import BackNavigationHandler from './nav/BackNavigationHandler';
import InitialNavigationDispatcher from './nav/InitialNavigationDispatcher';
import AppContainer from './nav/AppContainer';
import * as NavigationService from './nav/NavigationService';
import { initializeSentry } from './sentry';
import LoadingScreen from './start/LoadingScreen';

initializeSentry();

// $FlowFixMe
console.disableYellowBox = true; // eslint-disable-line

export default (): React$Node => (
  <CompatibilityChecker>
    <StoreProvider>
      <SafeAreaProvider
        style={{
          // While waiting for the safe-area insets, this will
          // show. Best for it not to be a white flicker.
          backgroundColor: BRAND_COLOR,
        }}
      >
        <HideIfNotHydrated PlaceholderComponent={LoadingScreen}>
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
        </HideIfNotHydrated>
      </SafeAreaProvider>
    </StoreProvider>
  </CompatibilityChecker>
);
