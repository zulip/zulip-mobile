/* @flow strict-local */
import React from 'react';
import type { Node } from 'react';
import { Platform, UIManager } from 'react-native';
import 'react-native-url-polyfill/auto';
// $FlowFixMe[untyped-import]
import { ActionSheetProvider } from '@expo/react-native-action-sheet';

import RootErrorBoundary from './RootErrorBoundary';
import ZulipNavigationContainer from './nav/ZulipNavigationContainer';
import StoreProvider from './boot/StoreProvider';
import StoreHydratedGate from './boot/StoreHydratedGate';
import TranslationProvider from './boot/TranslationProvider';
import ThemeProvider from './boot/ThemeProvider';
import CompatibilityChecker from './boot/CompatibilityChecker';
import AppEventHandlers from './boot/AppEventHandlers';
import { initializeSentry } from './sentry';
import ZulipSafeAreaProvider from './boot/ZulipSafeAreaProvider';
import { OfflineNoticeProvider } from './boot/OfflineNoticeProvider';

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

export default function ZulipMobile(): Node {
  // If using react-native-gesture-handler directly, not just via React
  // Navigation, we should use a GestureHandlerRootView; see
  //  https://docs.swmansion.com/react-native-gesture-handler/docs/1.10.3/#js
  //
  // React Nav seems to have followed the following advice, in that doc:
  //   > If you're using gesture handler in your component library, you may
  //   > want to wrap your library's code in the GestureHandlerRootView
  //   > component. This will avoid extra configuration for the user.
  // which I think is why they don't mention GestureHandlerRootView in their
  // own setup doc, and why I think it's probably fine to omit it if we're
  // not using r-n-gesture-handler directly ourselves.
  return (
    <RootErrorBoundary>
      <CompatibilityChecker>
        <StoreProvider>
          <ZulipSafeAreaProvider>
            <StoreHydratedGate>
              <AppEventHandlers>
                <TranslationProvider>
                  <ThemeProvider>
                    <OfflineNoticeProvider>
                      <ActionSheetProvider>
                        <ZulipNavigationContainer />
                      </ActionSheetProvider>
                    </OfflineNoticeProvider>
                  </ThemeProvider>
                </TranslationProvider>
              </AppEventHandlers>
            </StoreHydratedGate>
          </ZulipSafeAreaProvider>
        </StoreProvider>
      </CompatibilityChecker>
    </RootErrorBoundary>
  );
}
