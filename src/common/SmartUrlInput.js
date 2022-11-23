/* @flow strict-local */
import React, { useState, useRef, useCallback, useContext } from 'react';
import type { Node } from 'react';
import { TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { ViewStyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet';

import { ThemeContext, createStyleSheet, HALF_COLOR } from '../styles';

const styles = createStyleSheet({
  wrapper: {
    flexDirection: 'row',
    opacity: 0.8,
  },
  realmInput: {
    flex: 1,
    padding: 0,
    fontSize: 20,
  },
});

type Props = $ReadOnly<{|
  style?: ViewStyleProp,
  onChangeText: (value: string) => void,
  onSubmitEditing: () => Promise<void>,
|}>;

export default function SmartUrlInput(props: Props): Node {
  const { style, onChangeText, onSubmitEditing } = props;

  // We should replace the fixme with
  // `React$ElementRef<typeof TextInput>` when we can. Currently, that
  // would make `.current` be `any(implicit)`, which we don't want;
  // this is probably down to bugs in Flow's special support for React.
  const textInputRef = useRef<$FlowFixMe>();

  const [value, setValue] = useState<string>('');

  const themeContext = useContext(ThemeContext);

  // When the route is focused in the navigation, focus the input.
  // Otherwise, if you go back to this screen from the auth screen, the
  // input won't be focused.
  useFocusEffect(
    useCallback(() => {
      if (textInputRef.current) {
        // Sometimes the effect of this `.focus()` is immediately undone
        // (the keyboard is closed) by a Keyboard.dismiss() from React
        // Navigation's internals. Seems like a complex bug, but the symptom
        // isn't terrible, it just means that on back-navigating to this
        // screen, sometimes the keyboard flicks open then closed, instead
        // of just opening. Shrug. See
        //   https://chat.zulip.org/#narrow/stream/243-mobile-team/topic/realm-input/near/1346690
        //
        // `.current` is not type-checked; see definition.
        textInputRef.current.focus();
      }
    }, []),
  );

  const handleChange = useCallback(
    (_value: string) => {
      setValue(_value);
      onChangeText(_value);
    },
    [onChangeText],
  );

  return (
    <View style={[styles.wrapper, style]}>
      <TextInput
        value={value}
        placeholder="your-org.zulipchat.com"
        placeholderTextColor={HALF_COLOR}
        style={[styles.realmInput, { color: themeContext.color }]}
        autoFocus
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="go"
        onChangeText={handleChange}
        blurOnSubmit={false}
        keyboardType="url"
        underlineColorAndroid="transparent"
        onSubmitEditing={onSubmitEditing}
        enablesReturnKeyAutomatically
        ref={textInputRef}
      />
    </View>
  );
}
