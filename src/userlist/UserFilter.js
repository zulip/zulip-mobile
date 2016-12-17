import React, { Component } from 'react';

import { Input } from '../common';

export default class UserDrawer extends Component {

  props: {
    onChange: (text: string) => void,
  };

  render() {
    const { onChange } = this.props;

    return (
      <Input
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
