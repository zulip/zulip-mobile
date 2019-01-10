/* @flow strict */

export const caseInsensitiveCompareFunc = (a: string, b: string): number =>
  a.toLowerCase().localeCompare(b.toLowerCase());

export const numberWithSeparators = (value: number | string): string =>
  value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

export function deeperMerge<K, V>(obj1: { [K]: V }, obj2: { [K]: V }): { [K]: V } {
  return Array.from(new Set([...Object.keys(obj1), ...Object.keys(obj2)])).reduce((newObj, key) => {
    newObj[key] =
      obj1[key] === undefined
        ? obj2[key]
        : obj2[key] === undefined
          ? obj1[key]
          : { ...obj1[key], ...obj2[key] };
    return newObj;
  }, ({}: { [K]: V }));
}

export const initialsFromString = (name: string): string =>
  (name.match(/\S+\s*/g) || []).map(x => x[0].toUpperCase()).join('');

export function groupItemsById<T: { +id: number }>(items: T[]): { [id: number]: T } {
  return items.reduce((itemsById, item) => {
    itemsById[item.id] = item;
    return itemsById;
  }, {});
}

export const isValidEmailFormat = (email: string = ''): boolean => /\S+@\S+\.\S+/.test(email);
