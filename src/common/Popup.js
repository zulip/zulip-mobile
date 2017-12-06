/* @flow */
import React, { PureComponent } from 'react';
import type { ChildrenArray } from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  popup: {
    marginLeft: 20,
    marginRight: 20,
    margin: 2,
    borderRadius: 5,
    shadowOpacity: 0.25,
    elevation: 3,
  },
});

type Props = {
  children: ChildrenArray<*>,
};

export default class Popup extends PureComponent<Props> {
  props: Props;

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
