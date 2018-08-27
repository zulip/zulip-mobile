/* @flow */
import React, { PureComponent } from 'react';
import { TextInput } from 'react-native';

import type { LocalizableText, Style } from '../types';
import { Input } from '../common';

type Props = {
  value?: string,
  style?: Style,
  placeholder?: LocalizableText,
  onChange?: (text: string) => void,
  onBlur?: () => void,
  onFocus?: () => void,
  onSelectionChange?: (event: Object) => void,
  textInputRef?: (component: any) => void,
};

/**
 * Provides multi-line capabilities on top of an Input component.
 *
 * @prop [value] - Value of the input component.
 *   Setting this turns it into a controlled component.
 * @prop [style] - Style applied to the TextInput component.
 * @prop [placeholder] - Text to be shown when no value is entered.
 * @prop [onChange] - Event called when text is edited.
 * @prop [onBlur] - Event called on component losing focus.
 * @prop [onFocus] - Event called on component acquiring focus.
 * @prop [onSelectionChange] - Event called when text selection occurs or changes.
 * @prop textInputRef - Callback used to pass a reference to the
 *   wrapped TextInput to parent component.
 */
export default class MultilineInput extends PureComponent<Props> {
  props: Props;

  static defaultProps = {
    placeholder: {},
  };

  textInput: TextInput;

  render() {
    const { onChange, ...restProps } = this.props;

    return (
      <Input
        bounces={false}
        multiline
        overScrollMode="never"
        underlineColorAndroid="transparent"
        onChangeText={onChange}
        {...restProps}
      />
    );
  }
}
