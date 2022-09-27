/* @flow strict-local */
import React from 'react';
import type { Node } from 'react';
import { View } from 'react-native';

import ZulipText from '../common/ZulipText';
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

export default function InfoItem(props: Props): Node {
  const { label, value } = props;

  return (
    <View style={styles.item}>
      <ZulipText style={styles.label} text={label} />
      <ZulipText style={styles.value} text={JSON.stringify(value)} />
    </View>
  );
}
