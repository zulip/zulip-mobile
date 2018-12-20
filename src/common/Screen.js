/* @flow strict-local */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';

import type {
  ChildrenArray,
  Context,
  Dimensions,
  GlobalState,
  LocalizableText,
  Style,
} from '../types';
import KeyboardAvoider from './KeyboardAvoider';
import OfflineNotice from './OfflineNotice';
import ZulipStatusBar from './ZulipStatusBar';
import { getSession } from '../selectors';
import ModalNavBar from '../nav/ModalNavBar';
import ModalSearchNavBar from '../nav/ModalSearchNavBar';

const componentStyles = StyleSheet.create({
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

type Props = {|
  autoFocus: boolean,
  centerContent: boolean,
  children: ChildrenArray<*>,
  safeAreaInsets: Dimensions,
  keyboardShouldPersistTaps?: 'never' | 'always' | 'handled',
  padding: boolean,
  search: boolean,
  title?: LocalizableText,
  scrollEnabled?: boolean,
  style?: Style,
  searchBarOnChange?: (text: string) => void,
|};

/**
 * A component representing a distinct screen of the app
 * ensuring consistent look-and-feel throughout.
 * It can control the status bar, can render a nav bar or
 * include a search input, center its contents, etc.
 *
 * @prop [autoFocus] - If search bar enabled, should it be focused initially.
 * @prop [centerContent] - Should the contents be centered.
 * @prop children - Components to render inside the screen.
 * @prop safeAreaInsets - Supports safe area edge offsetting. Google 'iOS Safe Area'.
 * @prop [keyboardShouldPersistTaps] - Sets the same prop value to the internal
 *   ScrollView component.
 * @prop [padding] - Should padding be added to the contents of the screen.
 * @prop [search] - If 'true' show a search box in place of the title.
 * @prop [title] - Text shown as the title of the screen.
 * @prop [style] - Additional style for the wrapper container.
 * @prop searchBarOnChange - Event called on search query change.
 */
class Screen extends PureComponent<Props> {
  context: Context;

  static contextTypes = {
    styles: () => null,
  };

  static defaultProps = {
    autoFocus: false,
    centerContent: false,
    keyboardShouldPersistTaps: 'handled',
    padding: false,
    scrollEnabled: true,
    search: false,
  };

  render() {
    const {
      autoFocus,
      centerContent,
      children,
      keyboardShouldPersistTaps,
      padding,
      safeAreaInsets,
      scrollEnabled,
      search,
      searchBarOnChange,
      style,
      title,
    } = this.props;
    const { styles: contextStyles } = this.context;

    return (
      <View style={[contextStyles.screen, { marginBottom: safeAreaInsets.bottom }]}>
        {/* $FlowFixMe-56 Cannot create ZulipStatusBar element because ST is not a React component. */}
        <ZulipStatusBar />
        {search ? (
          <ModalSearchNavBar autoFocus={autoFocus} searchBarOnChange={searchBarOnChange} />
        ) : (
          <ModalNavBar title={title} />
        )}
        <OfflineNotice />
        <KeyboardAvoider
          behavior="padding"
          style={[componentStyles.wrapper, padding && contextStyles.padding]}
          contentContainerStyle={[padding && contextStyles.padding]}
        >
          <ScrollView
            contentContainerStyle={
              /* $FlowFixMe wants ViewStyleProp */
              [contextStyles.flexed, centerContent && componentStyles.content, style]
            }
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

export default connect((state: GlobalState) => ({
  safeAreaInsets: getSession(state).safeAreaInsets,
}))(Screen);
