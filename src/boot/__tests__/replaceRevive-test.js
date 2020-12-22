/* eslint-disable no-shadow */
/* eslint-disable id-match */
/* eslint-disable no-underscore-dangle */
/* eslint-disable jest/valid-expect */
/* eslint-disable jest/no-conditional-expect */

import Immutable from 'immutable';
import { immutable as Serialize } from 'remotedev-serialize';

const serialize = Serialize(Immutable);
const stringify = serialize.stringify;
const parse = serialize.parse;

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

  describe('Record', () => {
    const ABRecord = Immutable.Record({ a: 1, b: 2 });
    const myRecord = new ABRecord({ b: 3 });

    const serialize = Serialize(Immutable, [ABRecord]);
    const stringify = serialize.stringify;
    const parse = serialize.parse;
    let stringifiedRecord;

    it('stringify', () => {
      stringifiedRecord = stringify(myRecord);
      expect(stringifiedRecord).toMatchSnapshot();
    });

    it('parse', () => {
      expect(parse(stringifiedRecord)).toEqual(myRecord);
    });
  });

  describe('Nested', () => {
    const ABRecord = Immutable.Record({
      map: Immutable.OrderedMap({ seq: data.seq, stack: data.stack }),
      repeat: data.repeat,
    });
    const nestedData = Immutable.Set(ABRecord(), data.orderedSet, data.range);

    const serialize = Serialize(Immutable, [ABRecord]);
    const stringify = serialize.stringify;
    const parse = serialize.parse;
    let stringifiedNested;

    it('stringify', () => {
      stringifiedNested = stringify(nestedData);
      expect(stringifiedNested).toMatchSnapshot();
    });

    it('parse', () => {
      expect(parse(stringifiedNested)).toEqual(nestedData);
    });
  });
  describe('With references', () => {
    it('serializes and deserializes', () => {
      const sharedValue = [];
      const Record = Immutable.Record({
        prop: sharedValue,
      });

      const refs = [Record];

      const obj = Immutable.Map({
        fst: new Record(),
        scnd: new Record(),
      });

      const serialized = stringify(obj, Serialize(Immutable, refs).replacer, null, true);
      const parsed = JSON.parse(serialized);

      const fstProp = parsed.data.fst.data.prop;
      const scndProp = parsed.data.scnd.data.prop;

      expect(fstProp).toEqual(scndProp);
      expect(Array.isArray(obj.get('fst').get('prop')));
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
        expect(deserialized).toEqual(data[key]);
        if (key === 'map' || key === 'orderedMap') {
          const deserializedDefault = parse(stringified);
          expect(deserializedDefault.get('a')).toEqual(customOneRepresentation);
        }
      });
    });
  });
});
