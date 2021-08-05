/* @flow strict-local */

export const removeItemsFromArray = (
  input: $ReadOnlyArray<number>,
  itemsToRemove: number[],
): $ReadOnlyArray<number> => {
  const output = input.filter((item: number) => !itemsToRemove.includes(item));
  return input.length === output.length ? input : output;
};

export function addItemsToArray<T>(input: $ReadOnlyArray<T>, itemsToAdd: T[]): $ReadOnlyArray<T> {
  const newItems = itemsToAdd.filter(item => !input.includes(item));
  return newItems.length > 0 ? [...input, ...itemsToAdd] : input;
}

export function filterArray<T>(
  input: $ReadOnlyArray<T>,
  predicate: T => boolean,
): $ReadOnlyArray<T> {
  const filteredList = input.filter(predicate);
  return filteredList.length === input.length ? input : filteredList;
}

export function replaceItemInArray<T>(
  input: T[],
  predicate: (item: T) => boolean,
  replaceFunc: (item?: T) => T,
): T[] {
  let replacementHappened = false;

  const newArray = input.map(x => {
    if (predicate(x)) {
      replacementHappened = true;
      return replaceFunc(x);
    }
    return x;
  });

  if (!replacementHappened) {
    newArray.push(replaceFunc());
  }

  return newArray;
}
