/* @flow strict */

export const transformToEncodedURI = (string: string): string =>
  string.replace(/\.\d/g, (match, p1, p2, offset, str) => `%${match[1]}`);
