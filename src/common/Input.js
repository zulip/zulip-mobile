/* @flow */
import React, { Component } from 'react';
import { TextInput } from 'react-native';
import { FormattedMessage } from 'react-intl';
import type { StyleObj } from 'react-native/Libraries/StyleSheet/StyleSheetTypes';

import styles, { HALF_COLOR } from '../styles';

export default class Input extends Component {
  props: {
    style: StyleObj,
    restProps?: any[],
    placeholder: string,
    textInputRef?: (component: TextInput) => void,
  };

  static defaultProps = {
    restProps: [],
    textInputRef: () => {},
  };

  render() {
    const { style, placeholder, textInputRef, ...restProps } = this.props;

    return (
      <FormattedMessage id={placeholder} defaultMessage={placeholder}>
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
