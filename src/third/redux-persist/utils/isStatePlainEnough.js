/* @flow strict-local */

// $FlowFixMe[untyped-import]
import isPlainObject from 'lodash.isplainobject';

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
  if (!isPlainObject(a)) {
    return false;
  }
  return true;
}
