import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { Input } from '../common';

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    margin: 4,
  },
  input: {
    flex: 1,
    marginLeft: -32,
    paddingLeft: 32,
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
        <Icon
          style={styles.icon}
          size={24}
          color="lightgray"
          name="search"
        />
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
        />
      </View>
    );
  }
}
