/* eslint-disable id-match */
/* eslint-disable no-underscore-dangle */

import Immutable from 'immutable';
import { immutable as Serialize } from 'remotedev-serialize';

import { stringify, parse } from '../store';

const data = {
  map: Immutable.Map({ a: 1, b: 2, c: 3, d: 4 }),
  orderedMap: Immutable.OrderedMap({ b: 2, a: 1, c: 3, d: 4 }),
  list: Immutable.List([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
  range: Immutable.Range(0, 7),
  repeat: Immutable.Repeat('hi', 100),
  set: Immutable.Set([10, 9, 8, 7, 6, 5, 4, 3, 2, 1]),
  orderedSet: Immutable.OrderedSet([10, 9, 8, 7, 6, 5, 4, 3, 2, 1]),
  seq: Immutable.Seq.Indexed.of(1, 2, 3, 4, 5, 6, 7, 8),
  stack: Immutable.Stack.of('a', 'b', 'c'),
  withTypeKey: {
    a: 1,
    __serializedType__: {
      b: [2],
      __serializedType__: { c: [3] },
    },
  },
};

describe('Immutable', () => {
  describe('Stringify / Parse', () => {
    const stringified = {};
    describe('Stringify', () => {
      Object.keys(data).forEach(key => {
        it(key, () => {
          stringified[key] = stringify(data[key]);
          expect(stringified[key]).toMatchSnapshot();
        });
      });
    });

    describe('Parse', () => {
      Object.keys(data).forEach(key => {
        it(key, () => {
          expect(parse(stringified[key])).toEqual(data[key]);
        });
      });
    });
  });

  describe('Custom replacer and reviver functions', () => {
    const customOneRepresentation = 'one';

    function customReplacer(key, value, defaultReplacer) {
      if (value === 1) {
        return { data: customOneRepresentation, __serializedType__: 'number' };
      }
      return defaultReplacer(key, value);
    }

    function customReviver(key, value, defaultReviver) {
      if (
        typeof value === 'object'
        && value.__serializedType__ === 'number'
        && value.data === customOneRepresentation
      ) {
        return 1;
      }
      return defaultReviver(key, value);
    }

    const serializeCustom = Serialize(Immutable, null, customReplacer, customReviver);

    Object.keys(data).forEach(key => {
      const stringified = serializeCustom.stringify(data[key]);
      it(key, () => {
        const deserialized = serializeCustom.parse(stringified);
        // Make sure serializeCustom round-trips
        expect(deserialized).toEqual(data[key]);
        if (key === 'map' || key === 'orderedMap') {
          const deserializedDefault = parse(stringified);
          // Make sure we actually stored `1` in the customReplacer's
          // representation, 'one'.
          //
          // If we were going to keep this test, it would probably be
          // wise to listen to `jest/no-conditional-expect` (see
          // https://github.com/zulip/zulip-mobile/pull/4348#discussion_r548761362)
          // -- but we're not; we'll remove this entire `describe`
          // block soon, when we're no longer using the
          // `Serialize.immutable` factory.
          //
          // eslint-disable-next-line jest/no-conditional-expect
          expect(deserializedDefault.get('a')).toEqual(customOneRepresentation);
        }
      });
    });
  });
});
