/* @flow strict-local */
import React, { useContext } from 'react';
import type { Node } from 'react';
import { View } from 'react-native';

import { ThemeContext, createStyleSheet } from '../styles';

const componentStyles = createStyleSheet({
  divider: {
    borderBottomWidth: 1,
  },
});

export default function OptionDivider(props: {||}): Node {
  const themeContext = useContext(ThemeContext);
  return (
    <View style={[componentStyles.divider, { borderBottomColor: themeContext.dividerColor }]} />
  );
}
