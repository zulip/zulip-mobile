/* @flow strict-local */

import React, { useContext } from 'react';
import type { Node } from 'react';
import { ScrollView, View } from 'react-native';
import type { ViewStyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { EditingEvent } from 'react-native/Libraries/Components/TextInput/TextInput';

import styles, { createStyleSheet, ThemeContext } from '../styles';
import type { LocalizableText, LocalizableReactText } from '../types';
import KeyboardAvoider from './KeyboardAvoider';
import LoadingBanner from './LoadingBanner';
import ModalNavBar from '../nav/ModalNavBar';
import ModalSearchNavBar from '../nav/ModalSearchNavBar';

const componentStyles = createStyleSheet({
  screen: {
    flex: 1,
    flexDirection: 'column',
  },
  wrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  childrenWrapper: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
  },
});

type Props = $ReadOnly<{|
  centerContent?: boolean,
  children: Node,
  keyboardShouldPersistTaps?: 'never' | 'always' | 'handled',
  padding?: boolean,
  scrollEnabled?: boolean,
  style?: ViewStyleProp,

  search?: boolean,
  autoFocus?: boolean,
  searchBarOnChange?: (text: string) => void,
  searchBarOnSubmit?: (e: EditingEvent) => void,
  shouldShowLoadingBanner?: boolean,
  searchPlaceholder?: LocalizableText,

  canGoBack?: boolean,
  title?: LocalizableReactText,
|}>;

/**
 * Wrapper component for each screen of the app, for consistent look-and-feel.
 *
 * Provides a nav bar, colors the status bar, can center the contents, etc.
 * The `children` are ultimately wrapped in a `ScrollView` from upstream.
 *
 * @prop [centerContent] - Should the contents be centered.
 * @prop children - Components to render inside the screen.
 * @prop [keyboardShouldPersistTaps] - Passed through to ScrollView.
 * @prop [padding] - Should padding be added to the contents of the screen.
 * @prop [scrollEnabled] - Whether to use a ScrollView or a normal View.
 * @prop [style] - Additional style for the ScrollView.
 *
 * @prop [search] - If 'true' show a search box in place of the title.
 * @prop [autoFocus] - If search bar enabled, should it be focused initially.
 * @prop [searchBarOnChange] - Event called on search query change.
 * @prop [searchBarOnSubmit] - Event called on search query submit.
 * @prop [searchPlaceholder] - text shown as search placeholder.
 *
 * @prop [canGoBack] - If true (the default), show UI for "navigate back".
 * @prop [title] - Text shown as the title of the screen.
 *                 Required unless `search` is true.
 */
export default function Screen(props: Props): Node {
  const { backgroundColor } = useContext(ThemeContext);
  const {
    autoFocus = false,
    canGoBack = true,
    centerContent = false,
    children,
    keyboardShouldPersistTaps = 'handled',
    padding = false,
    scrollEnabled = true,
    search = false,
    searchPlaceholder,
    searchBarOnChange = (text: string) => {},
    style,
    title = '',
    shouldShowLoadingBanner = true,
    searchBarOnSubmit = (e: EditingEvent) => {},
  } = props;

  return (
    <SafeAreaView
      mode="padding"
      edges={['bottom']}
      style={[componentStyles.screen, { backgroundColor }]}
    >
      {search ? (
        <ModalSearchNavBar
          autoFocus={autoFocus}
          canGoBack={canGoBack}
          searchBarOnChange={searchBarOnChange}
          searchBarOnSubmit={searchBarOnSubmit}
          placeholder={searchPlaceholder}
        />
      ) : (
        <ModalNavBar canGoBack={canGoBack} title={title} />
      )}
      {shouldShowLoadingBanner && <LoadingBanner />}
      <KeyboardAvoider
        behavior="padding"
        style={[componentStyles.wrapper, padding && styles.padding]}
      >
        {scrollEnabled ? (
          <ScrollView
            contentContainerStyle={[centerContent && componentStyles.content, style]}
            style={componentStyles.childrenWrapper}
            keyboardShouldPersistTaps={keyboardShouldPersistTaps}
          >
            {children}
          </ScrollView>
        ) : (
          <View
            style={[
              componentStyles.childrenWrapper,
              centerContent && componentStyles.content,
              style,
            ]}
          >
            {children}
          </View>
        )}
      </KeyboardAvoider>
    </SafeAreaView>
  );
}
