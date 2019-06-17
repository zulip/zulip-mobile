/* @flow strict-local */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import { RawLabel } from '../common';

const styles = StyleSheet.create({
  item: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: 'hsla(0, 0%, 50%, 0.25)',
  },
  label: {
    fontWeight: 'bold',
  },
  value: {
    opacity: 0.9,
  },
});

type Props = {|
  label: string,
  value: mixed,
|};

export default class InfoItem extends PureComponent<Props> {
  render() {
    const { label, value } = this.props;

    return (
      <View style={styles.item}>
        <RawLabel style={styles.label} text={label} />
        <RawLabel style={styles.value} text={JSON.stringify(value)} />
      </View>
    );
  }
}
