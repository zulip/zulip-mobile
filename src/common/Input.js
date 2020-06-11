/* @flow strict-local */
import React, { PureComponent } from 'react';
import { TextInput } from 'react-native';
import { FormattedMessage } from 'react-intl';

import type { Context, LocalizableText } from '../types';
import { HALF_COLOR, BORDER_COLOR } from '../styles';

export type Props = $ReadOnly<{|
  ...$PropertyType<TextInput, 'props'>,
  placeholder: LocalizableText,
  onChangeText?: (text: string) => void,
  textInputRef?: (component: ?TextInput) => void,
|}>;

type State = {|
  isFocused: boolean,
|};

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
export default class Input extends PureComponent<Props, State> {
  context: Context;
  state = {
    isFocused: false,
  };
  textInput: ?TextInput;

  static contextTypes = {
    styles: () => null,
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
    const { styles: contextStyles } = this.context;
    const { style, placeholder, textInputRef, ...restProps } = this.props;
    const { isFocused } = this.state;
    const fullPlaceholder =
      typeof placeholder === 'object' /* force linebreak */
        ? placeholder
        : { text: placeholder, values: undefined };

    return (
      <FormattedMessage
        id={fullPlaceholder.text}
        defaultMessage={fullPlaceholder.text}
        values={fullPlaceholder.values}
      >
        {(text: string) => (
          <TextInput
            style={[contextStyles.input, style]}
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
