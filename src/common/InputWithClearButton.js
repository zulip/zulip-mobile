/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

import type { Context, LocalizableText } from '../types';
import Input from './Input';
import { BRAND_COLOR } from '../styles';
import Icon from './Icons';

const componentStyles = StyleSheet.create({
  clearButtonIcon: {
    color: BRAND_COLOR,
    paddingRight: 16,
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

/**
 * A component wrapping Input and providing an 'X' button
 * to clear the entered text.
 *
 * @prop [placeholder] - Text to be shown when no value is entered.
 * @prop onChangeText - Event called when text is edited.
 */
export default class InputWithClearButton extends PureComponent<Props, State> {
  context: Context;
  props: Props;
  state: State = {
    canBeCleared: false,
    text: '',
  };
  textInput: ?TextInput;

  static contextTypes = {
    styles: () => null,
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
    if (this.textInput) {
      this.textInput.clear();
    }
  };

  render() {
    const { styles } = this.context;
    const { canBeCleared, text } = this.state;

    return (
      <View style={styles.row}>
        <Input
          placeholder={this.props.placeholder}
          textInputRef={textInput => {
            this.textInput = textInput;
          }}
          onChangeText={this.handleChangeText}
          value={text}
        />
        {canBeCleared && (
          <Icon
            name="x"
            size={24}
            onPress={this.handleClear}
            style={componentStyles.clearButtonIcon}
          />
        )}
      </View>
    );
  }
}
