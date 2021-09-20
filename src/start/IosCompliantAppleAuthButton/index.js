/* @flow strict-local */
import React, { useState, useEffect } from 'react';
import type { Node } from 'react';
import { View } from 'react-native';
import type { ViewStyle } from 'react-native/Libraries/StyleSheet/StyleSheet';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useSelector } from '../../react-redux';

import type { SubsetProperties } from '../../generics';
import Custom from './Custom';
import { getGlobalSettings } from '../../selectors';

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
export default function IosCompliantAppleAuthButton(props: Props): Node {
  const { style, onPress } = props;
  const theme = useSelector(state => getGlobalSettings(state).theme);
  const [isNativeButtonAvailable, setIsNativeButtonAvailable] = useState<boolean | void>(undefined);

  useEffect(() => {
    async function getAndSetIsAvailable() {
      setIsNativeButtonAvailable(await AppleAuthentication.isAvailableAsync());
    }
    // This nesting is odd, but we get an ESLint warning if we make the
    // `useEffect` callback itself an async function. See
    //   https://github.com/zulip/zulip-mobile/pull/4906#discussion_r673557179
    // and
    //   https://github.com/facebook/react/issues/14326.
    getAndSetIsAvailable();
  }, []);

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
