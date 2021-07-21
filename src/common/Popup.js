/* @flow strict-local */
import React, { useContext } from 'react';
import type { Node } from 'react';
import { View } from 'react-native';

import { ThemeContext, createStyleSheet } from '../styles';

const styles = createStyleSheet({
  popup: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 5,
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 3,
    maxHeight: 250,
  },
});

type Props = $ReadOnly<{|
  children: Node,
|}>;

export default function Popup(props: Props): Node {
  const themeContext = useContext(ThemeContext);
  return (
    <View style={[{ backgroundColor: themeContext.backgroundColor }, styles.popup]}>
      {props.children}
    </View>
  );
}
