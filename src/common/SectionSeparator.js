/* @flow strict-local */
import React, { PureComponent } from 'react';
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

export default class SectionSeparator extends PureComponent<{||}> {
  render(): Node {
    return <View style={styles.separator} />;
  }
}
