/* @flow strict-local */

export default function isStatePlainEnough(a: mixed): boolean {
  // isPlainObject + duck type not immutable
  if (a === null) {
    return false;
  }
  if (typeof a !== 'object') {
    return false;
  }
  if (typeof a.asMutable === 'function') {
    return false;
  }
  const proto = Object.getPrototypeOf(a);
  return proto === null || Object.getPrototypeOf(proto) === null;
}
