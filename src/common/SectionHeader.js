/* @flow strict-local */
import React, { useContext } from 'react';
import type { Node } from 'react';
import { View } from 'react-native';

import { ThemeContext, createStyleSheet } from '../styles';
import ZulipTextIntl from './ZulipTextIntl';

const styles = createStyleSheet({
  header: {
    padding: 10,
    backgroundColor: 'hsla(0, 0%, 50%, 0.75)',
  },
});

type Props = $ReadOnly<{|
  text: string,
|}>;

export default function SectionHeader(props: Props): Node {
  const { text } = props;
  const themeData = useContext(ThemeContext);

  return (
    <View style={[styles.header, { backgroundColor: themeData.backgroundColor }]}>
      <ZulipTextIntl text={text} />
    </View>
  );
}
