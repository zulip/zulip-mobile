/* @flow strict-local */
import React, { useContext } from 'react';
import { View } from 'react-native';

import { ThemeContext, createStyleSheet } from '../styles';

const componentStyles = createStyleSheet({
  lineSeparator: {
    height: 1,
    margin: 4,
  },
});

export default function LineSeparator(props: {||}) {
  const themeContext = useContext(ThemeContext);
  return (
    <View style={[componentStyles.lineSeparator, { backgroundColor: themeContext.cardColor }]} />
  );
}
