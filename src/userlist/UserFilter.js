import React, { Component } from 'react';
import {
  StyleSheet,
  TextInput,
} from 'react-native';

const styles = StyleSheet.create({
  input: {
    height: 44,
    padding: 12,
  },
});

export default class UserDrawer extends Component {

  props: {
    onChange: (text: string) => void,
  };

  render() {
    const { onChange } = this.props;

    return (
      <TextInput
        autoCorrect={false}
        enablesReturnKeyAutomatically
        selectTextOnFocus
        clearButtonMode="always"
        style={styles.input}
        autoCapitalize="none"
        placeholder="Search people"
        returnKeyType="search"
        onChangeText={onChange}
      />
    );
  }
}
