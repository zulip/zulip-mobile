/* @flow */
import React, { PureComponent } from 'react';
import { View, TextInput } from 'react-native';

import type { LocalizableText, Style } from '../types';
import Input from './Input';
import { Label, Touchable } from '../common';

type Props = {
  style?: Style,
  placeholder: LocalizableText,
};

type State = {
  isHidden: boolean,
};

export default class PasswordInput extends PureComponent<Props, State> {
  static contextTypes = {
    styles: () => null,
  };

  textInput: TextInput;

  props: Props;

  state: State;

  state = {
    isHidden: true,
  };

  handleShow = () => {
    this.setState(({ isHidden }) => ({
      isHidden: !isHidden,
    }));
  };

  render() {
    const { styles } = this.context;
    const { style } = this.props;
    const { isHidden } = this.state;

    return (
      <View style={style}>
        <Input
          {...this.props}
          style={styles.passwordInput}
          secureTextEntry={isHidden}
          autoCorrect={false}
          autoCapitalize="none"
        />
        <Touchable style={styles.showPasswordButton} onPress={this.handleShow}>
          <Label style={styles.showPasswordButtonText} text={isHidden ? 'show' : 'hide'} />
        </Touchable>
      </View>
    );
  }
}
