/* @flow strict-local */
import React, { useState, useCallback, useContext } from 'react';
import type { Node } from 'react';
import { TextInput, Platform } from 'react-native';

import type { LocalizableText } from '../types';
import { createStyleSheet, ThemeContext, HALF_COLOR, BORDER_COLOR } from '../styles';
import { TranslationContext } from '../boot/TranslationProvider';

export type Props = $ReadOnly<{|
  ...React$ElementConfig<typeof TextInput>,
  placeholder: LocalizableText,
  onChangeText?: (text: string) => void,

  // We should replace the fixme with
  // `React$ElementRef<typeof TextInput>` when we can. Currently, that
  // would make `.current` be `any(implicit)`, which we don't want;
  // this is probably down to bugs in Flow's special support for React.
  textInputRef?: React$Ref<$FlowFixMe>,
|}>;

const componentStyles = createStyleSheet({
  input: {
    ...Platform.select({
      ios: {
        borderWidth: 1,
        borderColor: BORDER_COLOR,
        borderRadius: 2,
        padding: 8,
      },
    }),
  },
});

/**
 * A light abstraction over the standard TextInput component
 * that allows us to seamlessly provide internationalization
 * capabilities and also style the component depending on
 * the platform the app is running on.
 *
 * @prop [style] - Can override our default style for inputs.
 * @prop placeholder - Translated before passing to TextInput as
 *   a prop of the same name.
 * @prop [textInputRef] - Passed to TextInput in `ref`.  See upstream docs
 *   on refs: https://reactjs.org/docs/refs-and-the-dom.html
 * @prop ...all other TextInput props - Passed through verbatim to TextInput.
 *   See upstream: https://reactnative.dev/docs/textinput
 */
export default function Input(props: Props): Node {
  const { style, placeholder, textInputRef, ...restProps } = props;

  const [isFocused, setIsFocused] = useState<boolean>(false);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  const themeContext = useContext(ThemeContext);
  const _ = useContext(TranslationContext);

  return (
    <TextInput
      style={[componentStyles.input, { color: themeContext.color }, style]}
      placeholder={_(placeholder)}
      placeholderTextColor={HALF_COLOR}
      underlineColorAndroid={isFocused ? BORDER_COLOR : HALF_COLOR}
      onFocus={handleFocus}
      onBlur={handleBlur}
      ref={textInputRef}
      {...restProps}
    />
  );
}
