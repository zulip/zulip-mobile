/* @flow strict-local */
import React from 'react';
import type { Node } from 'react';
import { Platform, UIManager } from 'react-native';
import 'react-native-url-polyfill/auto';
import { SafeAreaProvider } from 'react-native-safe-area-context';
// $FlowFixMe[untyped-import]
import { ActionSheetProvider } from '@expo/react-native-action-sheet';

import RootErrorBoundary from './RootErrorBoundary';
import { BRAND_COLOR } from './styles';
import ZulipNavigationContainer from './nav/ZulipNavigationContainer';
import StoreProvider from './boot/StoreProvider';
import HideIfNotHydrated from './boot/HideIfNotHydrated';
import TranslationProvider from './boot/TranslationProvider';
import ThemeProvider from './boot/ThemeProvider';
import CompatibilityChecker from './boot/CompatibilityChecker';
import AppEventHandlers from './boot/AppEventHandlers';
import AppDataFetcher from './boot/AppDataFetcher';
import BackNavigationHandler from './nav/BackNavigationHandler';
import { initializeSentry } from './sentry';
import FullScreenLoading from './common/FullScreenLoading';

initializeSentry();

// $FlowFixMe[prop-missing]
console.disableYellowBox = true; // eslint-disable-line

// Enable `LayoutAnimation` on Android. Already enabled on iOS.
// https://reactnative.dev/docs/layoutanimation
if (Platform.OS === 'android') {
  // In the future, layout animation may be enabled by default. If
  // that happens, this method will probably be removed:
  // https://github.com/facebook/react-native/blob/v0.63.4/ReactAndroid/src/main/java/com/facebook/react/uimanager/UIManagerModule.java#L741-L755.
  //
  // In the meantime, we should be on the lookout for any issues with
  // this feature on Android.
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default (): Node => (
  <RootErrorBoundary>
    <CompatibilityChecker>
      <StoreProvider>
        <SafeAreaProvider
          style={{
            // While waiting for the safe-area insets, this will
            // show. Best for it not to be a white flicker.
            backgroundColor: BRAND_COLOR,
          }}
        >
          <HideIfNotHydrated PlaceholderComponent={FullScreenLoading}>
            <AppEventHandlers>
              <AppDataFetcher>
                <TranslationProvider>
                  <ThemeProvider>
                    <BackNavigationHandler>
                      <ActionSheetProvider>
                        <ZulipNavigationContainer />
                      </ActionSheetProvider>
                    </BackNavigationHandler>
                  </ThemeProvider>
                </TranslationProvider>
              </AppDataFetcher>
            </AppEventHandlers>
          </HideIfNotHydrated>
        </SafeAreaProvider>
      </StoreProvider>
    </CompatibilityChecker>
  </RootErrorBoundary>
);
