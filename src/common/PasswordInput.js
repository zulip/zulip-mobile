/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

import type { Context, LocalizableText } from '../types';
import Input from './Input';
import { BRAND_COLOR } from '../styles';
import Label from './Label';
import Touchable from './Touchable';

const componentStyles = StyleSheet.create({
  showPasswordButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  showPasswordButtonText: {
    margin: 8,
    color: BRAND_COLOR,
  },
});

type Props = {
  placeholder: LocalizableText,
};

type State = {
  isHidden: boolean,
};

/**
 * A password input component using Input internally.
 * Provides a 'show'/'hide' button to show the password.
 *
 * @prop [placeholder] - Text to be shown when no value is entered.
 */
export default class PasswordInput extends PureComponent<Props, State> {
  context: Context;
  props: Props;
  state: State = {
    isHidden: true,
  };
  textInput: TextInput;

  handleShow = () => {
    this.setState(({ isHidden }) => ({
      isHidden: !isHidden,
    }));
  };

  render() {
    const { placeholder } = this.props;
    const { isHidden } = this.state;

    return (
      <View>
        <Input
          placeholder={placeholder}
          secureTextEntry={isHidden}
          autoCorrect={false}
          autoCapitalize="none"
        />
        <Touchable style={componentStyles.showPasswordButton} onPress={this.handleShow}>
          <Label style={componentStyles.showPasswordButtonText} text={isHidden ? 'show' : 'hide'} />
        </Touchable>
      </View>
    );
  }
}
