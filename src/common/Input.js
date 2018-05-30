/* @flow */
import React, { PureComponent } from 'react';
import { TextInput } from 'react-native';
import { FormattedMessage } from 'react-intl';

import type { Context, LocalizableText, Style } from '../types';
import { nullFunction } from '../nullObjects';
import { HALF_COLOR, BORDER_COLOR } from '../styles';

type Props = {
  style?: Style,
  placeholder: LocalizableText,
  clearButton: boolean,
  onChangeText: (text: string) => void,
  textInputRef: (component: any) => void,
};

type State = {
  isFocused: boolean,
};

export default class Input extends PureComponent<Props, State> {
  context: Context;
  props: Props;
  state: State;
  textInput: TextInput;

  static contextTypes = {
    styles: () => null,
  };

  static defaultProps = {
    placeholder: {},
  };

  static defaultProps = {
    restProps: [],
    clearButton: false,
    onChangeText: nullFunction,
    textInputRef: nullFunction,
  };

  state = {
    isFocused: false,
  };

  handleClear = () => {
    const { onChangeText } = this.props;
    if (onChangeText) {
      onChangeText('');
    }
    this.textInput.clear();
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
        {text => (
          <TextInput
            style={[styles.input, style]}
            placeholder={text}
            placeholderTextColor={HALF_COLOR}
            underlineColorAndroid={isFocused ? BORDER_COLOR : HALF_COLOR}
            onFocus={this.handleFocus}
            onBlur={this.handleBlur}
            ref={(component: any) => {
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
