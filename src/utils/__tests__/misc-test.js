/* @flow strict-local */
import { isValidEmailFormat, numberWithSeparators, deeperMerge } from '../misc';

describe('numberWithSeparators', () => {
  test('do not change a small number', () => {
    expect(numberWithSeparators(0)).toEqual('0');
    expect(numberWithSeparators(123)).toEqual('123');
  });

  test('separates numbers with commas at 10 ^ 3', () => {
    expect(numberWithSeparators(12345)).toEqual('12,345');
    expect(numberWithSeparators(-12345)).toEqual('-12,345');
    expect(numberWithSeparators(1234567890)).toEqual('1,234,567,890');
  });
});

describe('deeperMerge', () => {
  test('two empty objects merge into an empty object', () => {
    const a = {};
    const b = {};
    const expectedResult = {};

    const result = deeperMerge(a, b);

    expect(result).toEqual(expectedResult);
  });

  test('two shallow objects get both keys', () => {
    const a = { key1: 1 };
    const b = { key2: 2 };
    const expectedResult = {
      key1: 1,
      key2: 2,
    };

    const result = deeperMerge(a, b);

    expect(result).toEqual(expectedResult);
  });

  test('two deep objects get both keys if keys differ', () => {
    const a = { parentKey1: { key1: 1 } };
    const b = { parentKey2: { key2: 2 } };
    const expectedResult = {
      parentKey1: { key1: 1 },
      parentKey2: { key2: 2 },
    };

    const result = deeperMerge(a, b);

    expect(result).toEqual(expectedResult);
  });

  test('two deep object return a merged key if keys are the same', () => {
    const a = { parentKey: { key1: 1 } };
    const b = { parentKey: { key2: 2 } };
    const expectedResult = { parentKey: { key1: 1, key2: 2 } };

    const result = deeperMerge(a, b);

    expect(result).toEqual(expectedResult);
  });

  test('objects are merged only two levels deep, then the second one overwrites the first one', () => {
    const a = { grandpaKey: { parentKey: { key1: 1 } } };
    const b = { grandpaKey: { parentKey: { key2: 2 } } };
    const expectedResult = { grandpaKey: { parentKey: { key2: 2 } } };

    const result = deeperMerge(a, b);

    expect(result).toEqual(expectedResult);
  });
});

describe('isValidEmail', () => {
  test('return true if email string is in valid format', () => {
    expect(isValidEmailFormat('a@a.com')).toBe(true);
  });

  test('return false if email string is in valid format', () => {
    expect(isValidEmailFormat('ab.com')).toBe(false);
    expect(isValidEmailFormat('@a.com')).toBe(false);
    expect(isValidEmailFormat('a@b')).toBe(false);
    expect(isValidEmailFormat('a@.com')).toBe(false);
  });
});
