/* @flow strict-local */

import React, { useContext } from 'react';
import type { Node } from 'react';
import { ScrollView } from 'react-native';
import type { ViewStyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet';
import { SafeAreaView } from 'react-native-safe-area-context';

import styles, { createStyleSheet, ThemeContext } from '../styles';
import type { LocalizableText } from '../types';
import KeyboardAvoider from './KeyboardAvoider';
import OfflineNotice from './OfflineNotice';
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
  +children: Node,
  keyboardShouldPersistTaps?: 'never' | 'always' | 'handled',
  padding?: boolean,
  scrollEnabled?: boolean,
  style?: ViewStyleProp,

  search?: boolean,
  autoFocus?: boolean,
  searchBarOnChange?: (text: string) => void,
  shouldShowLoadingBanner?: boolean,

  canGoBack?: boolean,
  +title?: LocalizableText,
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
 * @prop [scrollEnabled] - Passed through to ScrollView.
 * @prop [style] - Additional style for the ScrollView.
 *
 * @prop [search] - If 'true' show a search box in place of the title.
 * @prop [autoFocus] - If search bar enabled, should it be focused initially.
 * @prop [searchBarOnChange] - Event called on search query change.
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
    searchBarOnChange = (text: string) => {},
    style,
    title = '',
    shouldShowLoadingBanner = true,
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
        />
      ) : (
        <ModalNavBar canGoBack={canGoBack} title={title} />
      )}
      <OfflineNotice />
      {shouldShowLoadingBanner && <LoadingBanner />}
      <KeyboardAvoider
        behavior="padding"
        style={[componentStyles.wrapper, padding && styles.padding]}
        contentContainerStyle={[padding && styles.padding]}
      >
        <ScrollView
          contentContainerStyle={[
            // If `Screen` is responsible for managing scrolling,
            // keep its childrens' height unbounded. If not, set a
            // bounded height on its children, e.g., as required for
            // a child `FlatList` or `SectionList` to work (or even
            // another `ScrollView`, but hopefully we don't nest too
            // many of these!).
            !scrollEnabled ? styles.flexed : null,
            centerContent && componentStyles.content,
            style,
          ]}
          style={componentStyles.childrenWrapper}
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
          scrollEnabled={scrollEnabled}
        >
          {children}
        </ScrollView>
      </KeyboardAvoider>
    </SafeAreaView>
  );
}
