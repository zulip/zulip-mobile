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
  //
  // There are some bad interactions with react-native-screens. From
  // testing, they seem to be Android only, and they go away with
  // react-native-screens disabled:
  //  - With react-native-screens enabled, at least at 3.13.1 and 3.17.0, be
  //    careful when you want a single action to trigger animated layout
  //    changes on multiple screens at the same time. If a screen isn't
  //    focused when the layout change happens, the layout change and its
  //    animation might not happen until you focus the screen. I seemed to
  //    be able to fix this by calling react-native-screens's
  //    enableFreeze(true) at the top of this file, but I don't really
  //    understand why; here's the doc:
  //      https://github.com/software-mansion/react-freeze
  //  - With react-native-screens enabled, at least at 3.13.1 and 3.17.0, if
  //    I'm on a screen where a layout change is happening, and I navigate
  //    away during the animation, when I come back to the first screen it
  //    seems stuck at a snapshot of its layout, mid-animation, when I
  //    navigated away. I haven't found a fix except, at the moment the
  //    screen regains focus, to unmount and remount *all* affected views on
  //    the screen, with a changing `key` pseudoprop. This is awkward and
  //    unfortunately doesn't prevent the frozen layout from showing for a
  //    split second before the layout resets.
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
