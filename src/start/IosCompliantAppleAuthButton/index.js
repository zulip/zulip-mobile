/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View } from 'react-native';
import type { ViewStyle } from 'react-native/Libraries/StyleSheet/StyleSheet';
import * as AppleAuthentication from 'expo-apple-authentication';
import { connect } from '../../react-redux';

import type { SubsetProperties } from '../../generics';
import Custom from './Custom';
import type { ThemeName } from '../../reduxTypes';
import type { Dispatch } from '../../types';
import { getSettings } from '../../selectors';

type SelectorProps = $ReadOnly<{|
  theme: ThemeName,
|}>;

type Props = $ReadOnly<{|
  // See `ZulipButton`'s `style` prop, where a comment discusses this
  // idea.
  /* eslint-disable flowtype/generic-spacing */
  style?: SubsetProperties<
    ViewStyle,
    {|
      marginTop?: mixed,
    |},
  >,
  onPress: () => void | Promise<void>,

  dispatch: Dispatch,
  ...SelectorProps,
|}>;

type State = $ReadOnly<{|
  isNativeButtonAvailable: boolean | void,
|}>;

/**
 * A "Sign in with Apple" button (iOS only) that follows the rules.
 *
 * These official guidelines from Apple are at
 * https://developer.apple.com/design/human-interface-guidelines/sign-in-with-apple/overview/buttons/.
 *
 * Not to be used on Android. There, we also offer "Sign in with
 * Apple", but without marking it with a different style from the
 * other buttons.
 */
class IosCompliantAppleAuthButton extends PureComponent<Props, State> {
  state = {
    isNativeButtonAvailable: undefined,
  };

  async componentDidMount() {
    this.setState({ isNativeButtonAvailable: await AppleAuthentication.isAvailableAsync() });
  }

  render() {
    const { style, onPress, theme } = this.props;
    const { isNativeButtonAvailable } = this.state;
    if (isNativeButtonAvailable === undefined) {
      return <View style={[{ height: 44 }, style]} />;
    } else if (isNativeButtonAvailable) {
      return (
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
          buttonStyle={
            theme === 'default'
              ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE_OUTLINE
              : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
          }
          cornerRadius={22}
          style={[{ height: 44 }, style]}
          onPress={onPress}
        />
      );
    } else {
      return <Custom style={style} onPress={onPress} theme={theme} />;
    }
  }
}

export default connect(state => ({
  theme: getSettings(state).theme,
}))(IosCompliantAppleAuthButton);
