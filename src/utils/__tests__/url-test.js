/* @flow strict-local */
import base64 from 'base-64';
import {
  getResource,
  isUrlOnRealm,
  parseProtocol,
  isUrlAbsolute,
  isUrlRelative,
  isUrlPathAbsolute,
} from '../url';
import type { Auth } from '../../types';

const urlClassifierCases = {
  // These data are mostly a selection from this resource:
  //   https://github.com/web-platform-tests/wpt/blob/master/url/resources/urltestdata.json
  // which is referred to at the top of the URL Standard.
  absolute: ['https://example.com/foo', 'a1234567890-+.:foo/bar', 'AB://c/d'],
  pathAbsolute: ['/', '/foo/bar', '/.//path', '/../localhost/', '/:23', '/a/ /c'],
  otherRelative: [
    '//example.com/foo',
    '//foo/bar',
    '//',
    '///',
    '///test',
    '//www.example2.com',
    '10.0.0.7:8080/foo.html',
    'a!@$*=/foo.html',
    '#β',
  ],
};

const urlClassifierData = Object.keys(urlClassifierCases).flatMap(key =>
  urlClassifierCases[key].map(url => ({
    url,
    absolute: key === 'absolute',
    relative: key !== 'absolute',
    pathAbsolute: key === 'pathAbsolute',
  })),
);

/* eslint-disable no-underscore-dangle */
describe('isUrlAbsolute', () => {
  for (const case_ of urlClassifierData) {
    const { url, absolute: expected } = case_;
    test(`${expected ? 'accept' : 'reject'} ${url}`, () => {
      expect(isUrlAbsolute(url)).toEqual(expected);
    });
  }
});

describe('isUrlRelative', () => {
  for (const case_ of urlClassifierData) {
    const { url, relative: expected } = case_;
    test(`${expected ? 'accept' : 'reject'} ${url}`, () => {
      expect(isUrlRelative(url)).toEqual(expected);
    });
  }
});

describe('isUrlPathAbsolute', () => {
  for (const case_ of urlClassifierData) {
    const { url, pathAbsolute: expected } = case_;
    test(`${expected ? 'accept' : 'reject'} ${url}`, () => {
      expect(isUrlPathAbsolute(url)).toEqual(expected);
    });
  }
});

describe('getResource', () => {
  test('when uri contains domain, do not change, add auth headers', () => {
    const auth: Auth = {
      realm: new URL('https://example.com/'),
      apiKey: 'someApiKey',
      email: 'johndoe@example.com',
    };
    const authEncoded = base64.encode(`${auth.email}:${auth.apiKey}`);

    const expectedResult = {
      uri: 'https://example.com/img.gif',
      headers: {
        Authorization: `Basic ${authEncoded}`,
      },
    };
    const resource = getResource('https://example.com/img.gif', auth);
    expect(resource).toEqual(expectedResult);
  });

  const exampleAuth: Auth = {
    realm: new URL('https://example.com'),
    email: 'nobody@example.org',
    apiKey: 'someApiKey',
  };

  test('when uri does not contain domain, append realm, add auth headers', () => {
    const authEncoded = base64.encode(`${exampleAuth.email}:${exampleAuth.apiKey}`);

    const expectedResult = {
      uri: 'https://example.com/img.gif',
      headers: {
        Authorization: `Basic ${authEncoded}`,
      },
    };
    const resource = getResource('/img.gif', exampleAuth);
    expect(resource).toEqual(expectedResult);
  });

  test('when uri is on different domain than realm, do not include auth headers', () => {
    const expectedResult = {
      uri: 'https://another.com/img.gif',
    };
    const resource = getResource('https://another.com/img.gif', exampleAuth);
    expect(resource).toEqual(expectedResult);
  });
});

describe('isUrlOnRealm', () => {
  const realm = new URL('https://example.com');

  test('when link is on realm, return true', () => {
    expect(isUrlOnRealm('/#narrow/stream/jest', realm)).toBe(true);

    expect(isUrlOnRealm('https://example.com/#narrow/stream/jest', realm)).toBe(true);

    expect(isUrlOnRealm('#narrow/#near/1', realm)).toBe(true);
  });

  test('when link is on not realm, return false', () => {
    expect(isUrlOnRealm('https://demo.example.com', realm)).toBe(false);

    expect(isUrlOnRealm('www.google.com', realm)).toBe(false);
  });
});

describe('parseProtocol', () => {
  test('rejects strings that have no http/https protocol', () => {
    expect(parseProtocol('')).toEqual([null, '']);
    expect(parseProtocol('chat.zulip.com')).toEqual([null, 'chat.zulip.com']);
    expect(parseProtocol('ftp://chat.zulip.com')).toEqual([null, 'ftp://chat.zulip.com']);
    expect(parseProtocol('localhost:9991')).toEqual([null, 'localhost:9991']);
  });

  test('accepts strings that include the http/https protocol', () => {
    expect(parseProtocol('http://chat.zulip.com')).toEqual(['http://', 'chat.zulip.com']);
    expect(parseProtocol('https://chat.zulip.com')).toEqual(['https://', 'chat.zulip.com']);
    expect(parseProtocol('http://localhost:9991')).toEqual(['http://', 'localhost:9991']);
  });

  test('rejects strings that include a bogus http/https protocol indicator', () => {
    expect(parseProtocol('chat.zulip.com/http://')).toEqual([null, 'chat.zulip.com/http://']);
    expect(parseProtocol('example.net/https://')).toEqual([null, 'example.net/https://']);
  });

  test('accepts strings that include spaces before the protocol', () => {
    expect(parseProtocol('   https://chat.zulip.com')).toEqual(['https://', 'chat.zulip.com']);
    expect(parseProtocol('\t http://example.net')).toEqual(['http://', 'example.net']);
    // non-breaking space
    expect(parseProtocol('\xA0http://example.org')).toEqual(['http://', 'example.org']);
  });
});
