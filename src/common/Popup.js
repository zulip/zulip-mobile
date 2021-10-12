/* @flow strict-local */
import React, { useContext } from 'react';
import type { Node } from 'react';
import { View } from 'react-native';

import { ThemeContext, createStyleSheet } from '../styles';
import { useSelector } from '../react-redux';
import { getGlobalSettings } from '../directSelectors';

const styles = createStyleSheet({
  popup: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 5,
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
    maxHeight: 250,
    overflow: 'hidden',
  },

  overlay: {
    /*
     * Adding background color white with 12% overlay as specified in Material.io
     * Reference https://material.io/design/color/dark-theme.html#properties.
     * For more information
     */
    backgroundColor: 'hsla(0,0%,100%, 0.12)',
  },
});

type Props = $ReadOnly<{|
  children: Node,
|}>;

export default function Popup(props: Props): Node {
  const themeContext = useContext(ThemeContext);
  // Getting the active theme to set, the overlay only to the night mode.
  const theme = useSelector(state => getGlobalSettings(state).theme);
  return (
    <View style={[{ backgroundColor: themeContext.backgroundColor }, styles.popup]}>
      <View style={theme !== 'default' && styles.overlay}>{props.children}</View>
    </View>
  );
}
