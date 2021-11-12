/* @flow strict-local */
/* eslint-disable id-match */
/* eslint-disable no-underscore-dangle */

import Immutable from 'immutable';

import { FallbackAvatarURL, GravatarURL, UploadedAvatarURL } from '../../utils/avatar';
import { ZulipVersion } from '../../utils/zulipVersion';
import { stringify, parse, SERIALIZED_TYPE_FIELD_NAME } from '../replaceRevive';
import * as eg from '../../__tests__/lib/exampleData';
import { makeUserId } from '../../api/idTypes';

const data = {
  list: Immutable.List([1, 2, 'a', null]),
  map: Immutable.Map({ a: 1, b: 2, c: 3, d: 4 }),
  mapWithTypeKey: Immutable.Map({
    a: 1,
    [SERIALIZED_TYPE_FIELD_NAME]: {
      b: [2],
      [SERIALIZED_TYPE_FIELD_NAME]: { c: [3] },
    },
  }),
  // prettier-ignore
  mapNumKeys: Immutable.Map([[1, 1], [2, 2], [3, 3], [4, 4]]),
  emptyMap: Immutable.Map([]),
  date: new Date('2021-11-11T00:00:00.000Z'),
  zulipVersion: new ZulipVersion('3.0.0'),
  url: new URL('https://chat.zulip.org'),
  gravatarURL: GravatarURL.validateAndConstructInstance({ email: eg.selfUser.email }),
  uploadedAvatarURL: UploadedAvatarURL.validateAndConstructInstance({
    realm: eg.realm,
    absoluteOrRelativeUrl:
      '/user_avatars/2/e35cdbc4771c5e4b94e705bf6ff7cca7fa1efcae.png?x=x&version=2',
  }),
  fallbackAvatarURL: FallbackAvatarURL.validateAndConstructInstance({
    realm: eg.realm,
    userId: makeUserId(1),
  }),
  plainObjectWithTypeKey: {
    a: 1,
    [SERIALIZED_TYPE_FIELD_NAME]: {
      b: [2],
      [SERIALIZED_TYPE_FIELD_NAME]: { c: [3] },
    },
  },
};

const stringified = {
  list: '{"data":[1,2,"a",null],"__serializedType__":"ImmutableList"}',
  map: '{"data":{"a":1,"b":2,"c":3,"d":4},"__serializedType__":"ImmutableMap"}',
  mapWithTypeKey:
    '{"data":{"__serializedType__":"Object","data":{"a":1},"__serializedType__value":{"__serializedType__":"Object","data":{"b":[2]},"__serializedType__value":{"c":[3]}}},"__serializedType__":"ImmutableMap"}',
  mapNumKeys: '{"data":{"1":1,"2":2,"3":3,"4":4},"__serializedType__":"ImmutableMapNumKeys"}',
  emptyMap: '{"data":{},"__serializedType__":"ImmutableMap"}',
  date: '{"data":"2021-11-11T00:00:00.000Z","__serializedType__":"Date"}',
  zulipVersion: '{"data":"3.0.0","__serializedType__":"ZulipVersion"}',
  url: '{"data":"https://chat.zulip.org/","__serializedType__":"URL"}',
  gravatarURL:
    '{"data":"https://secure.gravatar.com/avatar/3b01d0f626dc6944ed45dbe6c86d3e30?d=identicon","__serializedType__":"GravatarURL"}',
  uploadedAvatarURL:
    '{"data":"https://zulip.example.org/user_avatars/2/e35cdbc4771c5e4b94e705bf6ff7cca7fa1efcae.png?x=x&version=2","__serializedType__":"UploadedAvatarURL"}',
  fallbackAvatarURL:
    '{"data":"https://zulip.example.org/avatar/1","__serializedType__":"FallbackAvatarURL"}',
  plainObjectWithTypeKey:
    '{"__serializedType__":"Object","data":{"a":1},"__serializedType__value":{"__serializedType__":"Object","data":{"b":[2]},"__serializedType__value":{"c":[3]}}}',
};

describe('Stringify', () => {
  Object.keys(data).forEach(key => {
    it(key, () => {
      expect(stringify(data[key])).toEqual(stringified[key]);
    });
  });

  test('catches an unexpectedly unhandled value with a `toJSON` method', () => {
    expect(() => stringify(new Performance())).toThrow();
  });

  test("catches a value that's definitely not serializable as-is", () => {
    expect(() => stringify(() => 'foo')).toThrow();
  });

  test('catches an unexpectedly unhandled value of an interesting type', () => {
    class Dog {
      noise = 'woof';
      makeNoise() {
        console.log(this.noise); // eslint-disable-line no-console
      }
    }
    expect(() => stringify(new Dog())).toThrow();
  });
});

describe('Parse', () => {
  Object.keys(data).forEach(key => {
    it(key, () => {
      expect(parse(stringified[key])).toEqual(data[key]);
    });
  });
});
