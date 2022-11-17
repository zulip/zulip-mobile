/* @flow strict-local */
import { isUrlOnRealm, isUrlAbsolute, isUrlRelative, isUrlPathAbsolute } from '../url';

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

describe('isUrlOnRealm', () => {
  const realm = new URL('https://example.com');

  test('when link is on realm, return true', () => {
    expect(isUrlOnRealm(new URL('/#narrow/stream/jest', realm), realm)).toBe(true);
    expect(isUrlOnRealm(new URL('#narrow/#near/1', realm), realm)).toBe(true);

    // https://example.com/www.google.com
    expect(isUrlOnRealm(new URL('www.google.com', realm), realm)).toBeTrue();

    expect(isUrlOnRealm(realm, realm)).toBeTrue();
    expect(isUrlOnRealm(new URL('/foo/bar.baz', realm), realm)).toBeTrue();
  });

  test('when link is not on realm, return false', () => {
    expect(isUrlOnRealm(new URL('https://demo.example.com/'), realm)).toBeFalse();
    expect(isUrlOnRealm(new URL('https://demo.example/'), realm)).toBeFalse();
  });
});
