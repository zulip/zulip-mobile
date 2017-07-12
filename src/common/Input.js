/* @flow */
import React, { Component } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { FormattedMessage } from 'react-intl';
import type { LocalizableText, StyleObj } from '../types';
import { HALF_COLOR } from '../styles';
import Icon from '../common/Icons';
import Touchable from '../common/Touchable';

const localStyles = StyleSheet.create({
  clearButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 18,
    height: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 18,
  },
  clearButtonIcon: {
    color: 'white',
    transform: [{ rotate: '45deg' }],
  },
});

export default class Input extends Component {
  static contextTypes = {
    styles: () => null,
  };

  textInput: TextInput;
  props: {
    style: StyleObj,
    restProps?: any[],
    placeholder: LocalizableText,
    clearButton?: boolean,
    onTextChange: (text: string) => void,
    textInputRef?: (component: TextInput) => void,
  };

  static defaultProps = {
    placeholder: {},
  };

  static defaultProps = {
    restProps: [],
    textInputRef: () => {},
  };

  state: {
    canBeCleared: boolean,
  };

  state = {
    canBeCleared: false,
  };

  handleTextChange = (text: string) => {
    this.setState({
      canBeCleared: text.length > 0,
    });
    this.props.onTextChange(text);
  };

  handleClear = () => {
    this.handleTextChange('');
    this.textInput.clear();
  };

  render() {
    const { styles } = this.context;
    const { style, placeholder, textInputRef, clearButton, ...restProps } = this.props;
    const { canBeCleared } = this.state;
    const placeholderMessage = placeholder.text || placeholder;

    return (
      <View style={styles.row}>
        <FormattedMessage
          id={placeholderMessage}
          defaultMessage={placeholderMessage}
          values={placeholder.values}>
          {text =>
            <TextInput
              style={[styles.input, style]}
              placeholder={text}
              placeholderTextColor={HALF_COLOR}
              ref={component => {
                this.textInput = component;
                if (textInputRef) textInputRef(component);
              }}
              onChangeText={this.handleTextChange}
              {...restProps}
            />}
        </FormattedMessage>
        {clearButton &&
          canBeCleared &&
          <Touchable onPress={this.handleClear} style={localStyles.clearButtonContainer}>
            <Icon name="md-add" size={15} style={localStyles.clearButtonIcon} />
          </Touchable>}
      </View>
    );
  }
}
