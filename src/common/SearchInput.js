/* @flow */
import React, { PureComponent } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { InputWithClearButton } from '../common';

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 0,
    minHeight: 50,
  },
});

type Props = {
  autoFocus: boolean,
  onChange: (text: string) => void,
};

export default class SearchInput extends PureComponent<Props> {
  props: Props;
  textInput: TextInput;

  static defaultProps = {
    autoFocus: true,
  };

  render() {
    const { autoFocus, onChange } = this.props;

    return (
      <View style={styles.wrapper}>
        <InputWithClearButton
          textInputRef={component => {
            this.textInput = component;
          }}
          style={styles.input}
          autoCorrect={false}
          enablesReturnKeyAutomatically
          selectTextOnFocus
          underlineColorAndroid="transparent"
          autoCapitalize="none"
          placeholder="Search"
          returnKeyType="search"
          onChangeText={onChange}
          autoFocus={autoFocus}
        />
      </View>
    );
  }
}
