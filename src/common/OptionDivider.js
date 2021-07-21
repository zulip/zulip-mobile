/* @flow strict-local */
import React, { useContext } from 'react';
import { View } from 'react-native';

import { ThemeContext, createStyleSheet } from '../styles';

const componentStyles = createStyleSheet({
  divider: {
    borderBottomWidth: 1,
  },
});

export default function OptionDivider(props: {||}) {
  const themeContext = useContext(ThemeContext);
  return (
    <View style={[componentStyles.divider, { borderBottomColor: themeContext.dividerColor }]} />
  );
}
