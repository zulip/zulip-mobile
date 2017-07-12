/* @flow */
import React from 'react';
import { View, Dimensions } from 'react-native';

export default class Popup extends React.Component {
  static contextTypes = {
    styles: () => null,
  };

  render() {
    const { height } = Dimensions.get('window');
    return (
      <View style={this.context.styles.backgroundColor} maxHeight={height / 4}>
        {this.props.children}
      </View>
    );
  }
}
