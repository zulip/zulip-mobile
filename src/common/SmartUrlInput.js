/* @flow strict-local */
import React, { PureComponent } from 'react';
import { StyleSheet, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import type { ViewStyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet';
import type { NavigationEventSubscription, NavigationScreenProp } from 'react-navigation';

import type { Context } from '../types';
import { autocompleteUrl, fixRealmUrl, hasProtocol } from '../utils/url';
import RawLabel from './RawLabel';

const styles = StyleSheet.create({
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

type Props = {|
  defaultValue: string,
  defaultOrganization: string,
  protocol: string,
  append: string,
  navigation: NavigationScreenProp<mixed>,
  style?: ViewStyleProp,
  onChangeText: (value: string) => void,
  onSubmitEditing: () => Promise<void>,
  enablesReturnKeyAutomatically: boolean,
|};

type State = {|
  value: string,
|};

export default class SmartUrlInput extends PureComponent<Props, State> {
  context: Context;
  state = {
    value: '',
  };
  textInputRef: ?TextInput;
  focusListener: void | NavigationEventSubscription;

  static contextTypes = {
    styles: () => null,
  };

  componentDidMount() {
    this.focusListener = this.props.navigation.addListener('didFocus', () => {
      if (this.textInputRef) {
        this.textInputRef.focus();
      }
    });
  }

  componentWillUnmount() {
    if (this.focusListener) {
      this.focusListener.remove();
    }
  }

  handleChange = (value: string) => {
    this.setState({ value });

    const { append, protocol, onChangeText } = this.props;
    onChangeText(fixRealmUrl(autocompleteUrl(value, protocol, append)));
  };

  urlPress = () => {
    const { textInputRef } = this;
    if (textInputRef) {
      textInputRef.blur();
      setTimeout(() => textInputRef.focus(), 100);
    }
  };

  renderPlaceholderPart = (text: string) => (
    <TouchableWithoutFeedback onPress={this.urlPress}>
      <RawLabel
        style={[styles.realmInput, this.context.styles.color, styles.realmPlaceholder]}
        text={text}
      />
    </TouchableWithoutFeedback>
  );

  render() {
    const { styles: contextStyles } = this.context;
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
      <View style={[styles.wrapper, style]}>
        {!hasProtocol(value) && this.renderPlaceholderPart(protocol)}
        <TextInput
          style={[
            styles.realmInput,
            contextStyles.color,
            value.length === 0 && styles.realmInputEmpty,
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
          ref={(component: TextInput | null) => {
            this.textInputRef = component;
          }}
        />
        {value.length === 0 && this.renderPlaceholderPart(defaultOrganization)}
        {showAppend && this.renderPlaceholderPart(append)}
      </View>
    );
  }
}
