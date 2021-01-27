/* @flow strict-local */

import React, { PureComponent } from 'react';
import type { Node as React$Node } from 'react';
import { View, ScrollView } from 'react-native';
import type { ViewStyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet';
import { type EdgeInsets } from 'react-native-safe-area-context';

import { withSafeAreaInsets } from '../react-native-safe-area-context';
import type { ThemeData } from '../styles';
import styles, { createStyleSheet, ThemeContext } from '../styles';
import type { LocalizableText } from '../types';
import KeyboardAvoider from './KeyboardAvoider';
import OfflineNotice from './OfflineNotice';
import LoadingBanner from './LoadingBanner';
import ZulipStatusBar from './ZulipStatusBar';
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
  centerContent: boolean,
  +children: React$Node,
  insets: EdgeInsets,
  keyboardShouldPersistTaps: 'never' | 'always' | 'handled',
  padding: boolean,
  scrollEnabled: boolean,
  style?: ViewStyleProp,

  search: boolean,
  autoFocus: boolean,
  searchBarOnChange: (text: string) => void,
  shouldShowLoadingBanner: boolean,

  canGoBack: boolean,
  +title: LocalizableText,
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
class Screen extends PureComponent<Props> {
  static contextType = ThemeContext;
  context: ThemeData;

  static defaultProps = {
    centerContent: false,
    keyboardShouldPersistTaps: 'handled',
    padding: false,
    scrollEnabled: true,

    search: false,
    autoFocus: false,
    searchBarOnChange: (text: string) => {},
    shouldShowLoadingBanner: true,

    canGoBack: true,
    title: '',
  };

  render() {
    const {
      autoFocus,
      canGoBack,
      centerContent,
      children,
      keyboardShouldPersistTaps,
      padding,
      insets,
      scrollEnabled,
      search,
      searchBarOnChange,
      style,
      title,
      shouldShowLoadingBanner,
    } = this.props;

    return (
      <View
        style={[
          componentStyles.screen,
          { backgroundColor: this.context.backgroundColor },
          { paddingBottom: insets.bottom },
        ]}
      >
        <ZulipStatusBar />
        <View style={{ height: insets.top }} />
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
            contentContainerStyle={[styles.flexed, centerContent && componentStyles.content, style]}
            style={componentStyles.childrenWrapper}
            keyboardShouldPersistTaps={keyboardShouldPersistTaps}
            scrollEnabled={scrollEnabled}
          >
            {children}
          </ScrollView>
        </KeyboardAvoider>
      </View>
    );
  }
}

export default withSafeAreaInsets(Screen);
