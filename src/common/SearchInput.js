import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import { Input } from '../common';
import { BRAND_COLOR } from './styles';

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    margin: 4,
    flex: 1
  },
  input: {
    flex: 1,
    borderWidth: 0,
    color: BRAND_COLOR
  },
});

export default class SearchInput extends Component {

  props: {
    onChange: (text: string) => void,
  };

  render() {
    const { onChange } = this.props;

    return (
      <View style={styles.wrapper}>
        <Input
          customStyle={styles.input}
          autoCorrect={false}
          enablesReturnKeyAutomatically
          selectTextOnFocus
          clearButtonMode="always"
          autoCapitalize="none"
          placeholder="Search"
          returnKeyType="search"
          onChangeText={onChange}
          autoFocus
        />
      </View>
    );
  }
}
