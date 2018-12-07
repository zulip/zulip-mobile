/* @flow */
import React, { PureComponent } from 'react';
import { TextInput } from 'react-native';

import type { LocalizableText, Style } from '../types';
import Input from './Input';

type Props = {|
  value?: string,
  style?: Style,
  placeholder?: LocalizableText,
  onChangeText?: (text: string) => void,
  onBlur?: () => void,
  onFocus?: () => void,
  onSelectionChange?: (event: Object) => void,
  onTouchStart?: () => void,
  textInputRef?: (component: ?TextInput) => void,
|};

/**
 * Provides multi-line capabilities on top of an Input component.
 *
 * All props are passed through to `Input`.  See `Input` for descriptions.
 */
export default class MultilineInput extends PureComponent<Props> {
  props: Props;

  static defaultProps = {
    placeholder: {},
  };

  render() {
    return <Input multiline underlineColorAndroid="transparent" {...this.props} />;
  }
}
