/* @flow strict-local */
import React from 'react';
import type { Context } from 'react';
import { StyleSheet } from 'react-native';

import type { ThemeName } from '../types';
import navStyles from './navStyles';
import miscStyles from './miscStyles';

export type ThemeColors = {|
  color: string,
  backgroundColor: string,
  cardColor: string,
  dividerColor: string,
|};

export type AppStyles = $ReadOnly<{|
  ...$Call<typeof navStyles, ThemeColors>,
  ...$Call<typeof miscStyles, ThemeColors>,
|}>;

export const themeColors: { [string]: ThemeColors } = {
  night: {
    color: '#d5d9dd',
    backgroundColor: '#212D3B',
    cardColor: '#253547',
    // Dividers follow Material Design: opacity 12% black or 12% white.
    // See https://material.io/guidelines/components/dividers.html
    dividerColor: 'rgba(255, 255, 255, 0.12)',
  },
  light: {
    color: '#333',
    backgroundColor: 'white',
    cardColor: '#F8F8F8',
    // Dividers follow Material Design: opacity 12% black or 12% white.
    // See https://material.io/guidelines/components/dividers.html
    dividerColor: 'rgba(0, 0, 0, 0.12)',
  },
};
themeColors.default = themeColors.light;

export const ThemeContext: Context<ThemeColors> = React.createContext(themeColors.default);

export const stylesFromTheme = (name: ThemeName) => {
  const colors = themeColors[name];
  return StyleSheet.create({
    ...navStyles(colors),
    ...miscStyles(colors),
  });
};
