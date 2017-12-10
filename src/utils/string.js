/* @flow */

export const replaceAtIndex = (str: string, index: number, char: string): string =>
  `${str.substring(0, index)}${char}${str.substring(index + 1)}`;

export const transformToEncodedURI = (string: string): string => {
  const pattern = /\.\d/g;
  let match;
  while ((match = pattern.exec(string))) {
    string = replaceAtIndex(string, match.index, '%');
  }
  return string;
};
