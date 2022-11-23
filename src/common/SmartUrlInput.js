/* @flow strict-local */
import React, { useCallback, useContext } from 'react';
import type { Node } from 'react';
import { TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { ThemeContext, createStyleSheet, HALF_COLOR } from '../styles';

const styles = createStyleSheet({
  wrapper: {
    flexDirection: 'row',
    opacity: 0.8,
    marginTop: 16,
    marginBottom: 8,
  },
  realmInput: {
    flex: 1,
    padding: 0,
    fontSize: 20,
  },
});

type Props = $ReadOnly<{|
  onChangeText: (value: string) => void,
  value: string,
  onSubmitEditing: () => Promise<void>,
|}>;

export default function SmartUrlInput(props: Props): Node {
  const { onChangeText, value, onSubmitEditing } = props;

  const textInputRef = React.useRef<React$ElementRef<typeof TextInput> | null>(null);

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
        textInputRef.current.focus();
      }
    }, []),
  );

  return (
    <View style={styles.wrapper}>
      <TextInput
        value={value}
        placeholder="your-org.zulipchat.com"
        placeholderTextColor={HALF_COLOR}
        style={[styles.realmInput, { color: themeContext.color }]}
        autoFocus
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="go"
        onChangeText={onChangeText}
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
