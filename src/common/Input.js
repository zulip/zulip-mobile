/* @flow strict-local */
import React, { PureComponent } from 'react';
import { TextInput, Platform } from 'react-native';

import type { LocalizableText, GetText } from '../types';
import type { ThemeData } from '../styles';
import { createStyleSheet, ThemeContext, HALF_COLOR, BORDER_COLOR } from '../styles';
import { withGetText } from '../boot/TranslationProvider';

export type Props = $ReadOnly<{|
  ...React$ElementConfig<typeof TextInput>,
  placeholder: LocalizableText,
  onChangeText?: (text: string) => void,

  // We should replace the fixme with
  // `React$ElementRef<typeof TextInput>` when we can. Currently, that
  // would make `.current` be `any(implicit)`, which we don't want;
  // this is probably down to bugs in Flow's special support for React.
  textInputRef?: React$Ref<$FlowFixMe>,

  _: GetText,
|}>;

type State = {|
  isFocused: boolean,
|};

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
class Input extends PureComponent<Props, State> {
  static contextType = ThemeContext;
  context: ThemeData;

  state = {
    isFocused: false,
  };

  handleFocus = () => {
    this.setState({
      isFocused: true,
    });
  };

  handleBlur = () => {
    this.setState({
      isFocused: false,
    });
  };

  render() {
    const { style, placeholder, textInputRef, _, ...restProps } = this.props;
    const { isFocused } = this.state;
    const fullPlaceholder =
      typeof placeholder === 'object' /* force linebreak */
        ? placeholder
        : { text: placeholder, values: undefined };

    return (
      <TextInput
        style={[componentStyles.input, { color: this.context.color }, style]}
        placeholder={_(fullPlaceholder.text, fullPlaceholder.values)}
        placeholderTextColor={HALF_COLOR}
        underlineColorAndroid={isFocused ? BORDER_COLOR : HALF_COLOR}
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
        ref={textInputRef}
        {...restProps}
      />
    );
  }
}

export default withGetText(Input);
