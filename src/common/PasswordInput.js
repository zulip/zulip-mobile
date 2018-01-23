/* @flow */
import React, { PureComponent } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

import type { LocalizableText } from '../types';
import Input from './Input';
import { BRAND_COLOR } from '../styles';
import { Label, Touchable } from '../common';

const componentStyles = StyleSheet.create({
  button: {
    position: 'absolute',
    right: 0,
    alignItems: 'center',
    padding: 10,
  },
  buttonText: {
    color: BRAND_COLOR,
  },
});

type Props = {
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
    const { isHidden } = this.state;

    return (
      <View style={styles.row}>
        <Input
          {...this.props}
          secureTextEntry={isHidden}
          autoCorrect={false}
          autoCapitalize="none"
        />
        <Touchable style={componentStyles.button} onPress={this.handleShow}>
          <Label style={componentStyles.buttonText} text={isHidden ? 'show' : 'hide'} />
        </Touchable>
      </View>
    );
  }
}
