/* @flow */
import React, { PureComponent } from 'react';
import { View, Dimensions } from 'react-native';

export default class Popup extends PureComponent {
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
