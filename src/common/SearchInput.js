/* @flow */
import React, { Component } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { Input } from '../common';

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 0,
    // color: BRAND_COLOR,
  },
});

type Props = {
  onChange: (text: string) => void,
};

export default class SearchInput extends Component {
  props: Props;
  textInput: TextInput;

  render() {
    const { onChange } = this.props;

    return (
      <View style={styles.wrapper}>
        <Input
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
          onTextChange={onChange}
          autoFocus
          clearButton
        />
      </View>
    );
  }
}
