/* @flow */
import React, { PureComponent } from 'react';
import type { ChildrenArray } from 'react';
import { View, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  popup: {
    marginRight: 20,
    marginLeft: 20,
    marginBottom: 2,
    bottom: 0,
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
    return (
      <View style={[this.context.styles.backgroundColor, styles.popup]}>{this.props.children}</View>
    );
  }
}
