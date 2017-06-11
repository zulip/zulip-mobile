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
    noBorder?: boolean
  };

  static defaultProps = {
    restProps: [],
    textInputRef: () => {},
  };

  render() {
    const { style, placeholder, textInputRef, noBorder, ...restProps } = this.props;
    const removeBorder = (noBorder) ? { borderWidth: 0 } : undefined;
    return (
      <FormattedMessage id={placeholder} defaultMessage={placeholder}>
        {text => (
          <TextInput
            style={[styles.input, style, removeBorder]}
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
