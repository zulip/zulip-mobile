/* @flow */
import React, { PureComponent } from 'react';
import { TextInput } from 'react-native';
import { FormattedMessage } from 'react-intl';

import type { Context, LocalizableText, Style } from '../types';
import { nullFunction } from '../nullObjects';
import { HALF_COLOR } from '../styles';

type Props = {
  style?: Style,
  placeholder: LocalizableText,
  clearButton: boolean,
  onChangeText: (text: string) => void,
  textInputRef: (component: any) => void,
};

export default class Input extends PureComponent<Props> {
  context: Context;
  props: Props;
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

  handleClear = () => {
    const { onChangeText } = this.props;
    if (onChangeText) {
      onChangeText('');
    }
    this.textInput.clear();
  };

  render() {
    const { styles } = this.context;
    const { style, placeholder, textInputRef, ...restProps } = this.props;
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
