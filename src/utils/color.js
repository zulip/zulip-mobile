/* @flow */
import Color from 'color';

export const foregroundColorFromBackground = (color: string) =>
  Color(color).luminosity() > 0.4 ? 'black' : 'white';

export const colorHashFromName = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = hash * 31 + name.charCodeAt(1);
  let colorHash = hash % 0xffffff;
  if (colorHash < 0x100000) colorHash += 0x100000;
  return `#${colorHash.toString(16)}`;
};
