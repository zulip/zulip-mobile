/* @flow strict-local */
import { StyleSheet } from 'react-native';

import type { UtilityStyles } from './utilityStyles';
import type { ComposeBoxStyles } from './composeBoxStyles';
import type { NavStyles } from './navStyles';
import type { MiscStyles } from './miscStyles';
import type { ThemeName } from '../types';
import utilityStyles from './utilityStyles';
import composeBoxStyles from './composeBoxStyles';
import navStyles from './navStyles';
import miscStyles from './miscStyles';

export type AppStyles = UtilityStyles & ComposeBoxStyles & NavStyles & MiscStyles;

type ThemeColors = {|
  color: string,
  backgroundColor: string,
  borderColor: string,
  cardColor: string,
  dividerColor: string,
|};

const themeColors: { [string]: ThemeColors } = {
  night: {
    color: '#d5d9dd',
    backgroundColor: '#212D3B',
    borderColor: 'rgba(127, 127, 127, 0.25)',
    cardColor: '#253547',
    // Dividers follow Material Design: opacity 12% black or 12% white.
    // See https://material.io/guidelines/components/dividers.html
    dividerColor: 'rgba(255, 255, 255, 0.12)',
  },
  light: {
    color: '#333',
    backgroundColor: 'white',
    borderColor: 'rgba(127, 127, 127, 0.25)',
    cardColor: '#F8F8F8',
    // Dividers follow Material Design: opacity 12% black or 12% white.
    // See https://material.io/guidelines/components/dividers.html
    dividerColor: 'rgba(0, 0, 0, 0.12)',
  },
};
themeColors.default = themeColors.light;

export const stylesFromTheme = (name: ThemeName) => {
  const colors = themeColors[name];
  return StyleSheet.create({
    ...utilityStyles,
    ...composeBoxStyles(colors),
    ...navStyles(colors),
    ...miscStyles(colors),
  });
};
