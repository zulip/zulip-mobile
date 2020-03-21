/* @flow strict-local */
import { foregroundColorFromBackground, colorHashFromString } from '../color';

describe('foregroundColorFromBackground', () => {
  test('returns "black" for light backgrounds', () => {
    expect(foregroundColorFromBackground('#ffffff')).toEqual('black');
    expect(foregroundColorFromBackground('lightgray')).toEqual('black');
    expect(foregroundColorFromBackground('#b0b0b0')).toEqual('black');
  });

  test('returns "white" for dark backgrounds', () => {
    expect(foregroundColorFromBackground('#000000')).toEqual('white');
    expect(foregroundColorFromBackground('#333333')).toEqual('white');
    expect(foregroundColorFromBackground('#0000f0')).toEqual('white');
  });
});

describe('colorHashFromString', () => {
  test('returns a 6 digit hex number to use as a color ', () => {
    expect(colorHashFromString('')).toHaveLength(7);
    expect(colorHashFromString('😃')).toHaveLength(7);
    expect(colorHashFromString('John Doe')).toHaveLength(7);
    expect(colorHashFromString('abcdefghijklmnopqrstuvwxyz'.repeat(50))).toHaveLength(7);
  });

  test('produces the same output for the same input', () => {
    const hash1 = colorHashFromString('John Doe');
    const hash2 = colorHashFromString('John Doe');
    expect(hash1).toEqual(hash2);
  });

  test('produces different output for similar inputs', () => {
    const hash1 = colorHashFromString('John Doe, Juan Pérez');
    const hash2 = colorHashFromString('John Doe, Jean Dupont');
    expect(hash1).not.toEqual(hash2);
  });
});
