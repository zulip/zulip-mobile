import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
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

export default class SearchInput extends Component {

  props: {
    onChange: (text: string) => void,
  };

  render() {
    const { onChange } = this.props;

    return (
      <View style={styles.wrapper}>
        <Input
          style={styles.input}
          autoCorrect={false}
          enablesReturnKeyAutomatically
          selectTextOnFocus
          underlineColorAndroid="transparent"
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
