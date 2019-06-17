/* @flow strict-local */
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
    borderColor: 'hsla(0, 0%, 50%, 0.25)',
  },
  key: {},
  size: {
    fontWeight: 'bold',
  },
});

type Props = {|
  text: string,
  size: number,
|};

export default class SizeItem extends PureComponent<Props> {
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
