import { numberWithSeparators, deeperMerge } from '../misc';

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
  test('TODO', () => {
    const a = {};
    const b = {};
    const expectedResult = {};

    const result = deeperMerge(a, b);

    expect(result).toEqual(expectedResult);
  });

  test('TODO2', () => {
    const a = { key1: 1 };
    const b = { key2: 2 };
    const expectedResult = {
      key1: 1,
      key2: 2,
    };

    const result = deeperMerge(a, b);

    expect(result).toEqual(expectedResult);
  });

  test('TODO3', () => {
    const a = { parentKey1: { key1: 1 } };
    const b = { parentKey2: { key2: 2 } };
    const expectedResult = {
      parentKey1: { key1: 1 },
      parentKey2: { key2: 2 },
    };

    const result = deeperMerge(a, b);

    expect(result).toEqual(expectedResult);
  });

  test('TODO4', () => {
    const a = { parentKey: { key1: 1 } };
    const b = { parentKey: { key2: 2 } };
    const expectedResult = { parentKey: { key1: 1, key2: 2 } };

    const result = deeperMerge(a, b);

    expect(result).toEqual(expectedResult);
  });
});
