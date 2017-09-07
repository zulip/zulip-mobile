/* @flow */

export const caseInsensitiveCompareFunc = (a: any, b: any): number =>
  a.toLowerCase().localeCompare(b.toLowerCase());

export const caseInsensitiveCompareObjFunc = (key: string) => (a: any, b: any): number =>
  a[key].toLowerCase().localeCompare(b[key].toLowerCase());

export const numberWithSeparators = (value: number): string =>
  value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

export const deeperMerge = (obj1: Object, obj2: Object): Object =>
  Array.from(new Set([...Object.keys(obj1), ...Object.keys(obj2)])).reduce((newObj, key) => {
    newObj[key] =
      typeof obj1[key] === 'object' ? { ...obj1[key], ...obj2[key] } : obj2[key] || obj1[key];
    return newObj;
  }, {});
