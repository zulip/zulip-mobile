/* @flow strict-local */
import React, { useContext } from 'react';
import type { Node } from 'react';
import { View } from 'react-native';

import { ThemeContext, createStyleSheet } from '../styles';
import { useGlobalSelector } from '../react-redux';
import { getGlobalSettings } from '../directSelectors';

const styles = createStyleSheet({
  popup: {
    maxHeight: 250,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 5,
    overflow: 'hidden', // Keep the overlay inside the rounded corners.

    // Elevation of 8 agrees with menus and bottom sheets, which seem like
    // the best matches in this table:
    //   https://material.io/design/environment/elevation.html#default-elevations
    elevation: 8,
    // TODO(material): Is this the right shadow for that elevation?
    shadowOpacity: 0.5,
    shadowRadius: 16,
  },

  // In a dark theme, we signal elevation by overlaying the background with
  // white at low opacity, following the Material spec:
  //   https://material.io/design/color/dark-theme.html#properties
  // (In a light theme, the shadow does that job.)
  overlay: {
    backgroundColor: 'hsla(0, 0%, 100%, 0.12)', // elevation 8 -> alpha 0.12
  },
});

type Props = $ReadOnly<{|
  children: Node,
|}>;

/**
 * An elevated surface, good for autocomplete popups.
 *
 * If using this for something else, consider parametrizing its height, or
 * other constants in its styles.
 */
export default function Popup(props: Props): Node {
  const themeContext = useContext(ThemeContext);
  // TODO(color/theme): find a cleaner way to express this
  const isDarkTheme = useGlobalSelector(state => getGlobalSettings(state).theme !== 'default');
  return (
    <View style={[{ backgroundColor: themeContext.backgroundColor }, styles.popup]}>
      <View style={isDarkTheme && styles.overlay}>{props.children}</View>
    </View>
  );
}
