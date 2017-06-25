/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, TextInput } from 'react-native';

import type { LocalizableText, StyleObj } from '../types';
import { Input } from '../common';

const componentStyles = StyleSheet.create({
  input: {
    // borderWidth: 0,
    // backgroundColor: 'yellow',
    height: 100,
  },
});

export default class MultilineInput extends PureComponent {
  props: {
    style?: StyleObj,
    placeholder: LocalizableText,
    onChange?: (text: string) => void,
    onHeightChange?: (height: number) => void,
    textInputRef?: (component: TextInput) => void,
  };

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
    const { placeholder, textInputRef, style, onChange } = this.props;

    return (
      <Input
        style={[style, componentStyles.input]}
        multiline
        overScrollMode="never"
        bounces={false}
        underlineColorAndroid="transparent"
        onChangeText={onChange}
        onContentSizeChange={this.handleOnContentSizeChange}
        placeholder={placeholder}
        textInputRef={textInputRef}
      />
    );
  }
}
