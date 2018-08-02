/* eslint-disable spellcheck/spell-checker */
import {
  base64ToHex,
  hexToBase64,
  hexToAscii,
  asciiToHex,
  xorHexStrings,
  strToBase64,
  extractApiKey,
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

describe('strToBase64', () => {
  test('can handle an empty string', () => {
    const obj = '';
    const expected = '';

    const result = strToBase64(obj);

    expect(result).toBe(expected);
  });

  test('can encode any string', () => {
    const obj = {
      key: 'ABCabc123',
      empty: null,
      array: [1, 2, 3],
    };
    const expected = 'W29iamVjdCBPYmplY3Rd';

    const result = strToBase64(obj);

    expect(result).toBe(expected);
  });

  test('supports unicode characters', () => {
    const obj = { key: '😇😈' };
    const expected = 'W29iamVjdCBPYmplY3Rd';
    const result = strToBase64(obj);
    expect(result).toBe(expected);
  });
});
describe('extractApiKey', () => {
  test('correctly extracts an API key that has been XORed with a OTP', () => {
    const key = 'testing';
    const otp = 'A8348A93A83493';
    const encoded = xorHexStrings(asciiToHex(key), otp);
    expect(extractApiKey(encoded, otp)).toBe(key);
  });
});
