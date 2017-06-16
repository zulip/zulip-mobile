/* @flow */
import React from 'react';
import { View } from 'react-native';

export default class Popup extends React.Component {

  static contextTypes = {
    styles: () => null,
  };

  render() {
    return (
      <View
        style={this.context.styles.backgroundColor}
        maxHeight={250}
      >
        {this.props.children}
      </View>
    );
  }
}
