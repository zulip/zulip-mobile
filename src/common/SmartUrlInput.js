/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import type { StyleObj } from '../types';
import { fixRealmUrl } from '../utils/url';
import RawLabel from './RawLabel';

const componentStyles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    opacity: 0.8,
  },
});

type Props = {
  defaultValue: string,
  placeholder: string,
  prepend: string,
  append: string,
  shortAppend: string,
  style?: StyleObj,
  onChange: (value: string) => void,
  onSubmitEditing: () => Promise<void>,
};

export default class SmartUrlInput extends PureComponent<Props> {
  static contextTypes = {
    styles: () => null,
  };

  props: Props;

  handleChange = (input: string) => {
    const { append, prepend, onChange } = this.props;

    const urlEntered = `${prepend}${input || 'your-organization'}${append}`;
    const fixedRealm = fixRealmUrl(urlEntered);

    onChange(fixedRealm);
  };

  render() {
    const { styles } = this.context;
    const {
      placeholder,
      prepend,
      append,
      shortAppend,
      defaultValue,
      style,
      onSubmitEditing,
    } = this.props;
    const placeholderTextColor = (StyleSheet.flatten(styles.realmInput) || {}).color;

    return (
      <View style={componentStyles.wrapper}>
        <RawLabel style={styles.realmInput} text={prepend} />
        <TextInput
          style={[styles.realmInput, style]}
          autoFocus
          autoCorrect={false}
          autoCapitalize="none"
          placeholder={placeholder}
          placeholderTextColor={placeholderTextColor}
          returnKeyType="go"
          defaultValue={defaultValue}
          onChangeText={this.handleChange}
          blurOnSubmit={false}
          keyboardType="url"
          underlineColorAndroid="transparent"
          onSubmitEditing={onSubmitEditing}
        />
        <RawLabel style={styles.realmInput} text={true ? append : shortAppend} />
      </View>
    );
  }
}
