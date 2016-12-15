import React, { Component } from 'react';
import { StyleSheet } from 'react-native';

import { Input } from '../common';

const styles = StyleSheet.create({
  filter: {
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
      <Input
        customStyle={styles.filter}
        autoCorrect={false}
        enablesReturnKeyAutomatically
        selectTextOnFocus
        clearButtonMode="always"
        autoCapitalize="none"
        placeholder="Search people"
        returnKeyType="search"
        onChangeText={onChange}
      />
    );
  }
}
