/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, TextInput, TouchableWithoutFeedback, View } from 'react-native';

import type { Context, Style } from '../types';
import { autocompleteUrl, fixRealmUrl, hasProtocol } from '../utils/url';
import RawLabel from './RawLabel';

const componentStyles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    opacity: 0.8,
  },
  realmInput: {
    padding: 0,
    fontSize: 20,
  },
  realmPlaceholder: {
    opacity: 0.75,
  },
  realmInputEmpty: {
    width: 1,
  },
});

type Props = {
  defaultValue: string,
  defaultOrganization: string,
  protocol: string,
  append: string,
  navigation: Object,
  style?: Style,
  onChange: (value: string) => void,
  onSubmitEditing: () => Promise<void>,
  enablesReturnKeyAutomatically: boolean,
};

type State = {
  value: string,
};

export default class SmartUrlInput extends PureComponent<Props, State> {
  context: Context;
  state: State = {
    value: '',
  };
  textInputRef: any;
  focusListener: Object;

  static contextTypes = {
    styles: () => null,
  };

  componentDidMount() {
    this.focusListener = this.props.navigation.addListener('didFocus', () =>
      this.textInputRef.focus(),
    );
  }

  componentWillUnmount() {
    this.focusListener.remove();
  }

  handleChange = (value: string) => {
    this.setState({ value });

    const { append, protocol, onChange } = this.props;
    onChange(fixRealmUrl(autocompleteUrl(value, protocol, append)));
  };

  urlPress = () => {
    this.textInputRef.blur();
    setTimeout(() => this.textInputRef.focus(), 100);
  };

  renderPlaceholderPart = (text: string) => (
    <TouchableWithoutFeedback onPress={this.urlPress}>
      <RawLabel
        style={[
          componentStyles.realmInput,
          this.context.styles.color,
          componentStyles.realmPlaceholder,
        ]}
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
      defaultValue,
      style,
      onSubmitEditing,
      enablesReturnKeyAutomatically,
    } = this.props;
    let { value } = this.state;
    let showAppend = value.indexOf('.') === -1;
    if (defaultValue && value.length === 0) {
      showAppend = false;
      value = defaultValue;
    }

    return (
      <View style={[componentStyles.wrapper, style]}>
        {!hasProtocol(value) && this.renderPlaceholderPart(protocol)}
        <TextInput
          style={[
            componentStyles.realmInput,
            styles.color,
            value.length === 0 && componentStyles.realmInputEmpty,
          ]}
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
          enablesReturnKeyAutomatically={enablesReturnKeyAutomatically}
          ref={(component: any) => {
            this.textInputRef = component;
          }}
        />
        {value.length === 0 && this.renderPlaceholderPart(defaultOrganization)}
        {showAppend && this.renderPlaceholderPart(append)}
      </View>
    );
  }
}
