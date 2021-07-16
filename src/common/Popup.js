/* @flow strict-local */
import React, { useContext } from 'react';
import type { Node } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

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

/**
 * A floating box to contain autocomplete popups.
 *
 * Avoids the horizontal insets by adding appropriate margin.
 */
export default function Popup(props: Props): Node {
  const themeContext = useContext(ThemeContext);
  return (
    <SafeAreaView
      mode="margin"
      edges={['right', 'left']}
      style={[{ backgroundColor: themeContext.backgroundColor }, styles.popup]}
    >
      {props.children}
    </SafeAreaView>
  );
}
