/* @flow strict-local */
import React, { useState, useRef, useCallback, useContext } from 'react';
import { TextInput, TouchableWithoutFeedback, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { ViewStyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet';

import type { AppNavigationProp } from '../nav/AppNavigator';
import { ThemeContext, createStyleSheet } from '../styles';
import { autocompleteRealmPieces, autocompleteRealm, fixRealmUrl } from '../utils/url';
import type { Protocol } from '../utils/url';
import RawLabel from './RawLabel';

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

export default function SmartUrlInput(props: Props) {
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

  const urlPress = useCallback(() => {
    if (textInputRef.current) {
      // `.current` is not type-checked; see definition.
      textInputRef.current.blur();
      setTimeout(() => {
        if (textInputRef.current) {
          // `.current` is not type-checked; see definition.
          textInputRef.current.focus();
        }
      }, 100);
    }
  }, []);

  const renderPlaceholderPart = (text: string) => (
    <TouchableWithoutFeedback onPress={urlPress}>
      <RawLabel
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
