import Color from 'color';

export const foregroundColorFromBackground = (color: string) =>
  (Color(color).luminosity() > 0.4 ? 'black' : 'white');

export const getStatusBarColor = (color: string) =>
  (Color(color).darken(0.4));
