/* @flow */
import React, { PureComponent } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { FormattedMessage } from 'react-intl';

import type { LocalizableText, StyleObj } from '../types';
import { nullFunction } from '../nullObjects';
import { HALF_COLOR, BRAND_COLOR } from '../styles';
import Icon from '../common/Icons';
import Touchable from '../common/Touchable';

const localStyles = StyleSheet.create({
  clearButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 22,
    height: 22,
    marginRight: 12,
  },
  clearButtonIcon: {
    color: BRAND_COLOR,
    transform: [{ rotate: '45deg' }],
  },
});

export default class Input extends PureComponent {
  static contextTypes = {
    styles: () => null,
  };

  textInput: TextInput;
  props: {
    style: StyleObj,
    restProps?: any[],
    placeholder: LocalizableText,
    clearButton?: boolean,
    onChangeText: (text: string) => void,
    textInputRef?: (component: TextInput) => void,
  };

  static defaultProps = {
    placeholder: {},
  };

  static defaultProps = {
    restProps: [],
    textInputRef: nullFunction,
  };

  state: {
    canBeCleared: boolean,
  };

  state = {
    canBeCleared: false,
  };

  handleChangeText = (text: string) => {
    this.setState({
      canBeCleared: text.length > 0,
    });
    this.props.onChangeText(text);
  };

  handleClear = () => {
    this.handleChangeText('');
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
          values={placeholder.values}
        >
          {text => (
            <TextInput
              style={[styles.input, style]}
              placeholder={text}
              placeholderTextColor={HALF_COLOR}
              ref={component => {
                this.textInput = component;
                if (textInputRef) textInputRef(component);
              }}
              onChangeText={this.handleChangeText}
              {...restProps}
            />
          )}
        </FormattedMessage>
        {clearButton &&
          canBeCleared && (
            <Touchable onPress={this.handleClear} style={localStyles.clearButtonContainer}>
              <Icon name="md-add" size={30} style={localStyles.clearButtonIcon} />
            </Touchable>
          )}
      </View>
    );
  }
}
