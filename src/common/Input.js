import React, { Component } from 'react';
import { TextInput } from 'react-native';
import { FormattedMessage } from 'react-intl';

import styles, { HALF_COLOR } from '../styles';

export default class Input extends Component {
  props: {
    style: Object,
    restProps: any[],
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
