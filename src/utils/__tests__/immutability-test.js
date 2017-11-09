import deepFreeze from 'deep-freeze';

import {
  removeItemsFromArray,
  filterArray,
  replaceItemInArray,
  getFirstIfDeepEqual,
} from '../immutability';

describe('removeItemsFromArray', () => {
  test('return a new array with items removed, do not mutate input', () => {
    const inputArray = deepFreeze([1, 2, 3, 4, 5]);
    const itemsToRemove = [4, 5, 6];
    const expectedResult = [1, 2, 3];

    const result = removeItemsFromArray(inputArray, itemsToRemove);

    expect(result).toEqual(expectedResult);
  });

  test('when no items are removed, return the original array', () => {
    const inputArray = deepFreeze([1, 2, 3]);
    const itemsToRemove = [4, 5, 6];

    const result = removeItemsFromArray(inputArray, itemsToRemove);

    expect(result).toBe(inputArray);
  });
});

describe('filterArray', () => {
  test('filters an array according to given predicate', () => {
    const input = [1, 2, 3, 4, 5];
    const predicate = x => x % 2 === 0;
    const expectedResult = [2, 4];

    const result = filterArray(input, predicate);

    expect(result).toEqual(expectedResult);
  });

  test('do not return a new array if no items are filtered', () => {
    const input = [2, 4, 6];
    const predicate = x => x % 2 === 0;

    const result = filterArray(input, predicate);

    expect(result).toBe(input);
  });
});

describe('replaceItemInArray', () => {
  test('replace item by producing a new array', () => {
    const input = [1, 2, 3];
    const predicate = x => x === 2;
    const replaceFunc = x => 'two';
    const expectedResult = [1, 'two', 3];

    const result = replaceItemInArray(input, predicate, replaceFunc);

    expect(result).not.toBe(input);
    expect(result).toEqual(expectedResult);
  });

  test('replace several items if more than one match', () => {
    const input = [1, 2, 3, 4, 5];
    const predicate = x => x % 2 === 1;
    const replaceFunc = x => 'odd';
    const expectedResult = ['odd', 2, 'odd', 4, 'odd'];

    const result = replaceItemInArray(input, predicate, replaceFunc);

    expect(result).not.toBe(input);
    expect(result).toEqual(expectedResult);
  });

  test('if item is not found append it', () => {
    const input = [1, 2, 3];
    const predicate = x => x === 4;
    const replaceFunc = x => 'four';
    const expectedResult = [1, 2, 3, 'four'];

    const result = replaceItemInArray(input, predicate, replaceFunc);

    expect(result).not.toBe(input);
    expect(result).toEqual(expectedResult);
  });
});

describe('getFirstIfDeepEqual', () => {
  test('return second parameter if two parameters differ', () => {
    const first = 123;
    const second = 456;

    const result = getFirstIfDeepEqual(first, second);

    expect(result).toBe(second);
  });

  test('return second parameter if two arrays are deep equal', () => {
    const first = [1, 2, 3];
    const second = [1, 2, 3];

    const result = getFirstIfDeepEqual(first, second);

    expect(result).toBe(first);
  });

  test('return second parameter if two objects are deep equal', () => {
    const first = { hello: 'yo' };
    const second = { hello: 'yo' };

    const result = getFirstIfDeepEqual(first, second);

    expect(result).toBe(first);
  });

  test('123', () => {
    const first = { hello: 'yo', ignored: 123 };
    const second = { hello: 'yo', ignored: 456 };

    const result = getFirstIfDeepEqual(first, second, (a, b) => a.hello === b.hello);

    expect(result).toBe(first);
  });
});
