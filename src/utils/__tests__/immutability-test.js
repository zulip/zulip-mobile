import deepFreeze from 'deep-freeze';

import { removeItemsFromArray, filterArray } from '../immutability';

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
