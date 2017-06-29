/* @flow */
import React, { Component } from 'react';
import { TextInput } from 'react-native';
import { FormattedMessage } from 'react-intl';
import type { StyleObj } from 'react-native/Libraries/StyleSheet/StyleSheetTypes';

import type { LocalizableText } from '../types';
import { HALF_COLOR } from '../styles';

export default class Input extends Component {

  static contextTypes = {
    styles: () => null,
  };

  props: {
    style: StyleObj,
    restProps?: any[],
    placeholder: LocalizableText,
    textInputRef?: (component: TextInput) => void,
  };

  static defaultProps = {
    placeholder: {},
  };

  static defaultProps = {
    restProps: [],
    textInputRef: () => {},
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
            ref={component => { if (textInputRef) textInputRef(component); }}
            {...restProps}
          />
        )}
      </FormattedMessage>
    );
  }
}
