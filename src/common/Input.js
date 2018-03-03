/* @flow */
import React, { PureComponent } from 'react';
import { TextInput } from 'react-native';
import { FormattedMessage } from 'react-intl';

import type { LocalizableText, StyleObj } from '../types';
import { nullFunction } from '../nullObjects';
import { HALF_COLOR } from '../styles';

type Props = {
  style?: StyleObj,
  restProps: any[],
  placeholder: LocalizableText,
  clearButton: boolean,
  onChangeText: (text: string) => void,
  textInputRef: (component: any) => void,
};

export default class Input extends PureComponent<Props> {
  static contextTypes = {
    styles: () => null,
  };

  textInput: TextInput;
  props: Props;

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

  formatText = (text) => text.length > 35 ? text.substring(0, 35).concat('...') : text;

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
            placeholder={this.formatText(text)}
            placeholderTextColor={HALF_COLOR}
            ref={(component: any) => {
              this.textInput = component;
              if (textInputRef) textInputRef(component);
            }}
            {...restProps}
          />
        )}
      </FormattedMessage>
    );
  }
}
