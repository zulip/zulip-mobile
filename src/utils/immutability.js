/* @flow strict */

export const removeItemsFromArray = (input: number[], itemsToRemove: number[]): number[] => {
  const output = input.filter((item: number) => !itemsToRemove.includes(item));
  return input.length === output.length ? input : output;
};

export function addItemsToArray<T>(input: T[], itemsToAdd: T[]): T[] {
  const newItems = itemsToAdd.filter(item => !input.includes(item));
  return newItems.length > 0 ? [...input, ...itemsToAdd] : input;
}

export function filterArray<T>(input: T[], predicate: T => boolean): T[] {
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
