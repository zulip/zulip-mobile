/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, TextInput, TouchableWithoutFeedback, View } from 'react-native';

import type { StyleObj } from '../types';
import { autoCompleteUrl, fixRealmUrl, hasProtocol } from '../utils/url';
import RawLabel from './RawLabel';

const componentStyles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    opacity: 0.8,
  },
});

type Props = {
  defaultValue: string,
  defaultOrganization: string,
  protocol: string,
  append: string,
  shortAppend: string,
  style?: StyleObj,
  onChange: (value: string) => void,
  onSubmitEditing: () => Promise<void>,
};

type State = {
  value: string,
};

export default class SmartUrlInput extends PureComponent<Props, State> {
  textInputRef: any;
  props: Props;
  state: State = {
    value: '',
  };

  static contextTypes = {
    styles: () => null,
  };

  handleChange = (value: string) => {
    this.setState({ value });

    const { append, shortAppend, protocol, onChange } = this.props;
    onChange(fixRealmUrl(autoCompleteUrl(value, protocol, append, shortAppend)));
  };

  urlPress = () => {
    this.textInputRef.focus();
  };

  renderPlaceholderPart = (text: string) => (
    <TouchableWithoutFeedback onPress={this.urlPress}>
      <RawLabel
        style={[this.context.styles.realmInput, this.context.styles.realmPlaceholder]}
        text={text}
      />
    </TouchableWithoutFeedback>
  );

  render() {
    const { styles } = this.context;
    const {
      defaultOrganization,
      protocol,
      append,
      shortAppend,
      defaultValue,
      style,
      onSubmitEditing,
    } = this.props;
    const { value } = this.state;
    const useFullAppend = value.indexOf('.') === -1;
    const showAnyAppend = !value.match(/.+\..+\.+./g); // at least two dots

    return (
      <View style={[componentStyles.wrapper, style]}>
        {!hasProtocol(value) && this.renderPlaceholderPart(protocol)}
        <TextInput
          style={[styles.realmInput, value.length === 0 && styles.realmInputEmpty]}
          autoFocus
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="go"
          defaultValue={defaultValue}
          onChangeText={this.handleChange}
          blurOnSubmit={false}
          keyboardType="url"
          underlineColorAndroid="transparent"
          onSubmitEditing={onSubmitEditing}
          ref={(component: any) => {
            this.textInputRef = component;
          }}
        />
        {value.length === 0 && this.renderPlaceholderPart(defaultOrganization)}
        {showAnyAppend && this.renderPlaceholderPart(useFullAppend ? append : shortAppend)}
      </View>
    );
  }
}
