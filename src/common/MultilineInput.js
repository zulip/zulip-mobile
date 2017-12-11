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
  onBlur?: () => void,
  onFocus?: () => void,
  onHeightChange?: (height: number) => void,
  onSelectionChange?: (event: Object) => void,
  textInputRef?: (component: any) => void,
  selection?: Object,
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
    const {
      placeholder,
      textInputRef,
      style,
      onChange,
      onFocus,
      onBlur,
      onSelectionChange,
      value,
      selection,
    } = this.props;

    return (
      <Input
        style={[style]}
        multiline
        overScrollMode="never"
        bounces={false}
        underlineColorAndroid="transparent"
        onChangeText={onChange}
        onContentSizeChange={this.handleOnContentSizeChange}
        onFocus={onFocus}
        onBlur={onBlur}
        onSelectionChange={onSelectionChange}
        placeholder={placeholder}
        textInputRef={textInputRef}
        value={value}
        selection={selection}
      />
    );
  }
}
