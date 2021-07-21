/* @flow strict-local */
import React, { useContext } from 'react';
import type { Node } from 'react';
import { View } from 'react-native';

import { ThemeContext, createStyleSheet } from '../styles';

const componentStyles = createStyleSheet({
  lineSeparator: {
    height: 1,
    margin: 4,
  },
});

export default function LineSeparator(props: {||}): Node {
  const themeContext = useContext(ThemeContext);
  return (
    <View style={[componentStyles.lineSeparator, { backgroundColor: themeContext.cardColor }]} />
  );
}
