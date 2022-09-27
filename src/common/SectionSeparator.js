/* @flow strict-local */
import React from 'react';
import type { Node } from 'react';
import { View } from 'react-native';

import { createStyleSheet } from '../styles';

const styles = createStyleSheet({
  separator: {
    height: 1,
    margin: 10,
    backgroundColor: 'hsla(0, 0%, 50%, 0.75)',
  },
});

export default function SectionSeparator(props: {||}): Node {
  return <View style={styles.separator} />;
}
