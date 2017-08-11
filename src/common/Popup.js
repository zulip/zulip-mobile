/* @flow */
import React, { PureComponent } from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  popup: {
    marginLeft: 20,
    marginRight: 20,
    borderRadius: 5,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowRadius: 10,
    shadowOpacity: 0.25,
  },
});

export default class Popup extends PureComponent {
  static contextTypes = {
    styles: () => null,
  };

  render() {
    const { height } = Dimensions.get('window');

    return (
      <View style={[this.context.styles.backgroundColor, styles.popup]} maxHeight={height / 4}>
        {this.props.children}
      </View>
    );
  }
}
