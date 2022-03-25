// @flow strict-local

import { objectFromEntries } from '../jsBackport';

/**
 * Return an object where each property value equals the key.
 *
 * This is a handy idiom for making objects that function like enums.
 * For an example, see:
 *   https://flow.org/en/docs/enums/migrating-legacy-patterns/#toc-keymirror
 *
 * The main reason to use this helper rather than just write out the result
 * directly is that it lets Flow infer a more specific type.  For example:
 *
 *   const Status1 = keyMirror({ on: null, off: null });
 *   Status1.on; // type is 'on'
 *
 *   const Status2 = { on: 'on', off: 'off' };
 *   Status2.on; // type is string, which is less helpful
 */
export function keyMirror<O: { ... }>(o: O): $ObjMapi<O, <K>(K) => K> {
  return objectFromEntries(Object.keys(o).map(k => [k, k]));
}
