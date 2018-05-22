/* @flow */
import React, { PureComponent } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

import type { Context, LocalizableText } from '../types';
import Input from './Input';
import { BRAND_COLOR } from '../styles';
import Icon from '../common/Icons';
import Touchable from '../common/Touchable';

const componentStyles = StyleSheet.create({
  clearButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 22,
    height: 22,
    marginRight: 12,
  },
  clearButtonIcon: {
    color: BRAND_COLOR,
  },
});

type Props = {
  placeholder: LocalizableText,
  onChangeText: (text: string) => void,
};

type State = {
  canBeCleared: boolean,
  text: string,
};

export default class InputWithClearButton extends PureComponent<Props, State> {
  context: Context;
  props: Props;
  state: State;
  textInput: TextInput;

  static contextTypes = {
    styles: () => null,
  };

  state = {
    canBeCleared: false,
    text: '',
  };

  handleChangeText = (text: string) => {
    this.setState({
      canBeCleared: text.length > 0,
      text,
    });
    this.props.onChangeText(text);
  };

  handleClear = () => {
    this.handleChangeText('');
    this.textInput.clear();
  };

  render() {
    const { styles } = this.context;
    const { canBeCleared, text } = this.state;

    return (
      <View style={styles.row}>
        <Input
          {...this.props}
          textInputRef={textInput => {
            this.textInput = textInput;
          }}
          onChangeText={this.handleChangeText}
          value={text}
        />
        {canBeCleared && (
          <Touchable style={componentStyles.clearButtonContainer} onPress={this.handleClear}>
            <Icon name="x" size={20} style={componentStyles.clearButtonIcon} />
          </Touchable>
        )}
      </View>
    );
  }
}
