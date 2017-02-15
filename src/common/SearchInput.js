import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import { Input } from '../common';
import { BRAND_COLOR } from './styles';

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    margin: 4,
    flex: 1
  },
  input: {
    flex: 1,
    paddingLeft: 20,
    borderWidth: 0,
    marginTop: -3,
    marginBottom: -3,
    color: BRAND_COLOR
  },
  inputWrapper: {
    flex: 1,
    marginBottom: 4,
    marginRight: 5
  }
});

export default class SearchInput extends Component {

  props: {
    onChange: (text: string) => void,
  };

  render() {
    const { onChange } = this.props;

    return (
      <View style={styles.wrapper}>
        <View style={styles.inputWrapper}>
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
      </View>
    );
  }
}
