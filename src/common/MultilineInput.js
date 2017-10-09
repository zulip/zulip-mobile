/* @flow */
import React, { PureComponent } from 'react';
import { TextInput } from 'react-native';

import type { LocalizableText, StyleObj } from '../types';
import { Input } from '../common';

type Props = {
  style?: StyleObj,
  placeholder?: LocalizableText,
  value: string,
  onChange?: (text: string) => void,
  onHeightChange?: (height: number) => void,
  onSelectionChange?: (event: Object) => void,
  textInputRef?: (component: TextInput) => void,
};

export default class MultilineInput extends PureComponent<Props> {
  props: Props;

  static defaultProps = {
    placeholder: {},
  };

  textInput: TextInput;

  handleOnContentSizeChange = (event: Object) => {
    const { onHeightChange } = this.props;
    const contentHeight = event.nativeEvent.contentSize.height;
    if (onHeightChange) {
      onHeightChange(contentHeight);
    }
  };

  render() {
    const { placeholder, textInputRef, style, onChange, onSelectionChange, value } = this.props;

    return (
      <Input
        style={[style]}
        multiline
        overScrollMode="never"
        bounces={false}
        underlineColorAndroid="transparent"
        onChangeText={onChange}
        onContentSizeChange={this.handleOnContentSizeChange}
        onSelectionChange={onSelectionChange}
        placeholder={placeholder}
        textInputRef={textInputRef}
        value={value}
      />
    );
  }
}
