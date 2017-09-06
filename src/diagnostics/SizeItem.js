/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import { RawLabel } from '../common';
import { numberWithSeparators } from '../utils/misc';

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
    borderBottomWidth: 1,
    borderColor: 'rgba(127, 127, 127, 0.25)',
  },
  key: {},
  size: {
    fontWeight: 'bold',
  },
});

export default class SizeItem extends PureComponent {
  props: {
    text: string,
    size: number,
  };

  render() {
    const { text, size } = this.props;

    return (
      <View style={styles.item}>
        <RawLabel style={styles.key} text={text} />
        <RawLabel style={styles.size} text={numberWithSeparators(size)} />
      </View>
    );
  }
}
