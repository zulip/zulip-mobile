/* @flow strict-local */
import React, { useState, useRef, useCallback, useContext } from 'react';
import type { Node } from 'react';
import { Platform, TextInput, TouchableWithoutFeedback, View, Keyboard } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { ViewStyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet';

import type { AppNavigationProp } from '../nav/AppNavigator';
import { ThemeContext, createStyleSheet } from '../styles';
import { autocompleteRealmPieces, autocompleteRealm, fixRealmUrl } from '../utils/url';
import type { Protocol } from '../utils/url';
import ZulipText from './ZulipText';

const styles = createStyleSheet({
  wrapper: {
    flexDirection: 'row',
    opacity: 0.8,
  },
  realmInput: {
    padding: 0,
    fontSize: 20,
  },
  realmPlaceholder: {
    opacity: 0.75,
  },
  realmInputEmpty: {
    width: 1,
  },
});

type Props = $ReadOnly<{|
  /**
   * The protocol which will be used if the user doesn't specify one.
   * Should almost certainly be "https://".
   */
  defaultProtocol: Protocol,
  /**
   * The example organization name that will be displayed while the
   * entry field is empty. Appears, briefly, as the initial (lowest-
   * level) component of the realm's domain.
   */
  defaultOrganization: string,
  /**
   * The default domain to which the user's input will be appended, if
   * it appears not to contain an explicit domain.
   */
  defaultDomain: string,
  // TODO: Currently this type is acceptable because the only
  // `navigation` prop we pass to a `SmartUrlInput` instance is the
  // one from a component on AppNavigator.
  navigation: AppNavigationProp<>,
  style?: ViewStyleProp,
  onChangeText: (value: string) => void,
  onSubmitEditing: () => Promise<void>,
  enablesReturnKeyAutomatically: boolean,
|}>;

/**
 * Work around https://github.com/facebook/react-native/issues/19366.
 *
 * The bug: If the keyboard is dismissed only by pressing the built-in
 *   Android back button, then the next time you call `.focus()` on the
 *   input, the keyboard won't open again. On the other hand, if you call
 *   `.blur()`, then the keyboard *will* open the next time you call
 *   `.focus()`.
 *
 * This workaround: Call `.blur()` on the input whenever the keyboard is
 *   closed, because it might have been closed by the built-in Android back
 *   button. Then when we call `.focus()` the next time, it will open the
 *   keyboard, as expected. (We only maintain that keyboard-closed listener
 *   when this SmartUrlInput is on the screen that's focused in the
 *   navigation.)
 *
 * Other workarounds that didn't work:
 * - When it comes time to do a `.focus()`, do a sneaky `.blur()` first,
 *   then do the `.focus()` 100ms later. It's janky. This was #2078,
 *   probably inspired by
 *     https://github.com/facebook/react-native/issues/19366#issuecomment-400603928.
 * - Use RN's `BackHandler` to actually listen for the built-in Android back
 *   button being used. That didn't work; the event handler wasn't firing
 *   for either `backPress` or `hardwareBackPress` events. (We never
 *   committed a version of this workaround.)
 */
function useRn19366Workaround(textInputRef) {
  if (Platform.OS !== 'android') {
    return;
  }

  // (Disabling `react-hooks/rules-of-hooks` here is fine; the relevant rule
  // is not to call Hooks conditionally. But the platform conditional won't
  // vary in its behavior between multiple renders.)

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useFocusEffect(
    // eslint-disable-next-line react-hooks/rules-of-hooks
    React.useCallback(() => {
      const handleKeyboardDidHide = () => {
        if (textInputRef.current) {
          // `.current` is not type-checked; see definition.
          textInputRef.current.blur();
        }
      };

      Keyboard.addListener('keyboardDidHide', handleKeyboardDidHide);

      return () => Keyboard.removeListener('keyboardDidHide', handleKeyboardDidHide);
    }, [textInputRef]),
  );
}

export default function SmartUrlInput(props: Props): Node {
  const {
    defaultProtocol,
    defaultOrganization,
    defaultDomain,
    style,
    onChangeText,
    onSubmitEditing,
    enablesReturnKeyAutomatically,
  } = props;

  // We should replace the fixme with
  // `React$ElementRef<typeof TextInput>` when we can. Currently, that
  // would make `.current` be `any(implicit)`, which we don't want;
  // this is probably down to bugs in Flow's special support for React.
  const textInputRef = useRef<$FlowFixMe>();

  /**
   * The actual input string, exactly as entered by the user,
   * without modifications by autocomplete.
   */
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

      onChangeText(
        fixRealmUrl(
          autocompleteRealm(_value, { protocol: defaultProtocol, domain: defaultDomain }),
        ),
      );
    },
    [defaultDomain, defaultProtocol, onChangeText],
  );

  // When the "placeholder parts" are pressed, i.e., the parts of the URL
  //   line that aren't the TextInput itself, we still want to focus the
  //   TextInput.
  // TODO(?): Is it a confusing UX to have a line that looks and acts like
  //   a text input, but parts of it aren't really?
  const urlPress = useCallback(() => {
    if (textInputRef.current) {
      // `.current` is not type-checked; see definition.
      textInputRef.current.focus();
    }
  }, []);

  useRn19366Workaround(textInputRef);

  const renderPlaceholderPart = (text: string) => (
    <TouchableWithoutFeedback onPress={urlPress}>
      <ZulipText
        style={[styles.realmInput, { color: themeContext.color }, styles.realmPlaceholder]}
        text={text}
      />
    </TouchableWithoutFeedback>
  );

  const [prefix, , suffix] = autocompleteRealmPieces(value, {
    domain: defaultDomain,
    protocol: defaultProtocol,
  });

  return (
    <View style={[styles.wrapper, style]}>
      {prefix !== null && renderPlaceholderPart(prefix)}
      <TextInput
        style={[
          styles.realmInput,
          { color: themeContext.color },
          value.length === 0 && styles.realmInputEmpty,
        ]}
        autoFocus
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="go"
        onChangeText={handleChange}
        blurOnSubmit={false}
        keyboardType="url"
        underlineColorAndroid="transparent"
        onSubmitEditing={onSubmitEditing}
        enablesReturnKeyAutomatically={enablesReturnKeyAutomatically}
        ref={textInputRef}
      />
      {!value && renderPlaceholderPart(defaultOrganization)}
      {suffix !== null && renderPlaceholderPart(suffix)}
    </View>
  );
}
