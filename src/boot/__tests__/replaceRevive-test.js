/* @flow strict-local */
/* eslint-disable id-match */
/* eslint-disable no-underscore-dangle */

import Immutable from 'immutable';

import { FallbackAvatarURL, GravatarURL, UploadedAvatarURL } from '../../utils/avatar';
import { ZulipVersion } from '../../utils/zulipVersion';
import { stringify, parse, SERIALIZED_TYPE_FIELD_NAME } from '../replaceRevive';
import * as eg from '../../__tests__/lib/exampleData';

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
  mapNumKeys: Immutable.Map([[1, 1], [2, 2], [3, 3], [4, 4]]),
  emptyMap: Immutable.Map([]),
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
    userId: 1,
  }),
  plainObjectWithTypeKey: {
    a: 1,
    [SERIALIZED_TYPE_FIELD_NAME]: {
      b: [2],
      [SERIALIZED_TYPE_FIELD_NAME]: { c: [3] },
    },
  },
};

const stringified = {};
describe('Stringify', () => {
  Object.keys(data).forEach(key => {
    it(key, () => {
      stringified[key] = stringify(data[key]);
      expect(stringified[key]).toMatchSnapshot();
    });
  });

  test('catches an unexpectedly unhandled value with a `toJSON` method', () => {
    expect(() => stringify(new Date())).toThrow();
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
