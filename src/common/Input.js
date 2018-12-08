/* @flow strict-local */
import React, { PureComponent } from 'react';
import { TextInput } from 'react-native';
import { FormattedMessage } from 'react-intl';

import type { Context, LocalizableText, Style } from '../types';
import { nullFunction } from '../nullObjects';
import { HALF_COLOR, BORDER_COLOR } from '../styles';

// This ought to be exact, but Flow (0.78) gives a baffling error at each
// call site if I try that.  The error message is manifestly false -- it
// says "property restProps ... exists in" the props passed at the call site
// -- so there's clearly a bug here in Flow.
//
// From previous experience, this probably *does* reflect a real issue in
// our types; perhaps a future Flow version will be able to coherently
// point it out to us.
type Props = {
  ...$PropertyType<TextInput, 'props'>,
  style?: Style,
  placeholder: LocalizableText,
  onChangeText: (text: string) => void,
  textInputRef: (component: ?TextInput) => void,
};

type State = {
  isFocused: boolean,
};

/**
 * A light abstraction over the standard TextInput component
 * that allows us to seamlessly provide internationalization
 * capabilities and also style the component depending on
 * the platform the app is running on.
 *
 * @prop [style] - Can override our default style for inputs.
 * @prop [placeholder] - Translated before passing to TextInput as
 *   a prop of the same name.
 * @prop textInputRef - Passed to TextInput in `ref`.  See upstream docs
 *   on refs: https://reactjs.org/docs/refs-and-the-dom.html
 * @prop ...all other TextInput props - Passed through verbatim to TextInput.
 *   See upstream: https://facebook.github.io/react-native/docs/textinput
 */
export default class Input extends PureComponent<Props, State> {
  context: Context;
  props: Props;
  state: State = {
    isFocused: false,
  };
  textInput: ?TextInput;

  static contextTypes = {
    styles: () => null,
  };

  static defaultProps = {
    placeholder: {},
    restProps: [],
    onChangeText: nullFunction,
    textInputRef: nullFunction,
  };

  handleClear = () => {
    const { onChangeText } = this.props;
    if (onChangeText) {
      onChangeText('');
    }
    if (this.textInput) {
      this.textInput.clear();
    }
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
    const { styles } = this.context;
    const { style, placeholder, textInputRef, ...restProps } = this.props;
    const { isFocused } = this.state;
    const placeholderMessage = placeholder.text || placeholder;

    return (
      <FormattedMessage
        id={placeholderMessage}
        defaultMessage={placeholderMessage}
        values={placeholder.values}
      >
        {(text: string) => (
          <TextInput
            style={[styles.input, style]}
            placeholder={text}
            placeholderTextColor={HALF_COLOR}
            underlineColorAndroid={isFocused ? BORDER_COLOR : HALF_COLOR}
            onFocus={this.handleFocus}
            onBlur={this.handleBlur}
            ref={(component: ?TextInput) => {
              this.textInput = component;
              if (textInputRef) {
                textInputRef(component);
              }
            }}
            {...restProps}
          />
        )}
      </FormattedMessage>
    );
  }
}
