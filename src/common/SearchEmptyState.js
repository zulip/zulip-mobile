/* @flow strict-local */
import React from 'react';
import type { Node } from 'react';
import { View } from 'react-native';

import ZulipTextIntl from './ZulipTextIntl';
import { createStyleSheet } from '../styles';

const styles = createStyleSheet({
  container: {
    flex: 1,
    padding: 16,
    marginTop: 8,
    justifyContent: 'center',
  },
  text: {
    fontSize: 18,
    textAlign: 'center',
  },
});

type Props = $ReadOnly<{|
  text: string,
|}>;

export default function SearchEmptyState(props: Props): Node {
  const { text } = props;

  return (
    <View style={styles.container}>
      <ZulipTextIntl style={styles.text} text={text} />
    </View>
  );
}
