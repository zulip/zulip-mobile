/* @flow strict-local */
import {
  base64ToHex,
  hexToBase64,
  hexToAscii,
  asciiToHex,
  xorHexStrings,
  base64Utf8Encode,
} from '../encoding';

describe('base64ToHex', () => {
  test('correctly converts a base64 string to a hex string', () => {
    const hex = 'A8348A93A834938AF31348124D2392123192D23AB45C63092EA353BDFE2379DC';
    const base64 = 'qDSKk6g0k4rzE0gSTSOSEjGS0jq0XGMJLqNTvf4jedw=';

    expect(base64ToHex(base64)).toBe(hex);
  });
});

describe('hexToBase64', () => {
  test('correctly converts a hex string to a base64 string', () => {
    const hex = 'A8348A93A834938AF31348124D2392123192D23AB45C63092EA353BDFE2379DC';
    const base64 = 'qDSKk6g0k4rzE0gSTSOSEjGS0jq0XGMJLqNTvf4jedw=';

    expect(hexToBase64(hex)).toBe(base64);
  });
});

describe('xorHexStrings', () => {
  test('correctly XORs two hex strings of the same length', () => {
    const hex1 = 'A8348A93A834938AF31348124D2392123192D23AB45C63092EA353BDFE2379DC';
    const hex2 = 'FEA3914A39410903458238420142388DABEE932FE021CD23C024D324EEEEEEEE';
    const encoded = xorHexStrings(hex1, hex2);

    expect(xorHexStrings(encoded, hex1)).toBe(hex2);
    expect(xorHexStrings(encoded, hex2)).toBe(hex1);
  });

  test('throws an error if inputs differ in length', () => {
    const hex1 = 'A8348A93A834938AF31348124D2392123192D23AB45C63092EA353BDFE2379DC';
    const hex2 = 'FEA3914A39410903458238420142388DABEE932FE021CD23C024D324EEEEEEE';

    expect(() => xorHexStrings(hex1, hex2)).toThrow();
  });
});

describe('hexToAscii', () => {
  test('correctly converts a hex string to an ASCII encoded string', () => {
    const ascii = 'Thus spoke Zarathustra.';
    const hex = '546875732073706F6B65205A617261746875737472612E';
    expect(hexToAscii(hex)).toBe(ascii);
  });
});

describe('asciiToHex', () => {
  test('correctly converts an ASCII encoded string to a hex string', () => {
    const ascii = 'Thus spoke Zarathustra.';
    const hex = '546875732073706F6B65205A617261746875737472612E';

    expect(asciiToHex(ascii)).toBe(hex);
  });
});

describe('base64Utf8Encode', () => {
  test('can handle an empty string', () => {
    const text = '';
    const expected = '';
    const result = base64Utf8Encode(text);
    expect(result).toBe(expected);
  });

  test('supports Unicode characters outside the BMP', () => {
    const text = '😇😈';
    const expected = '8J+Yh/CfmIg=';
    const result = base64Utf8Encode(text);
    expect(result).toBe(expected);
  });
});
