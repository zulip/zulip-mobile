/* @flow strict-local */
/* eslint-disable id-match */
/* eslint-disable no-underscore-dangle */

import Immutable from 'immutable';

import { FallbackAvatarURL, GravatarURL, UploadedAvatarURL } from '../../utils/avatar';
import { ZulipVersion } from '../../utils/zulipVersion';
import { stringify, parse } from '../store';
import * as eg from '../../__tests__/lib/exampleData';

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
  withTypeKey: {
    a: 1,
    __serializedType__: {
      b: [2],
      __serializedType__: { c: [3] },
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
});

describe('Parse', () => {
  Object.keys(data).forEach(key => {
    it(key, () => {
      expect(parse(stringified[key])).toEqual(data[key]);
    });
  });
});
