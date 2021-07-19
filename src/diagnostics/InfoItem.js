/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View } from 'react-native';

import { RawLabel } from '../common';
import { createStyleSheet } from '../styles';
import type { JSONable } from '../utils/jsonable';

const styles = createStyleSheet({
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

type Props = $ReadOnly<{|
  label: string,
  value: JSONable,
|}>;

export default class InfoItem extends PureComponent<Props> {
  render(): React$Node {
    const { label, value } = this.props;

    return (
      <View style={styles.item}>
        <RawLabel style={styles.label} text={label} />
        <RawLabel style={styles.value} text={JSON.stringify(value)} />
      </View>
    );
  }
}
