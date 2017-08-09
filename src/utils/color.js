/* @flow */
import Color from 'color';

export const foregroundColorFromBackground = (color: string) =>
  Color(color).luminosity() > 0.4 ? 'black' : 'white';
