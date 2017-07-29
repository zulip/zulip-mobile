import deepFreeze from 'deep-freeze';

import { removeItemsFromArray } from '../unreadHelpers';

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
