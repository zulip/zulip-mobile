/* @flow strict-local */
import base64 from 'base-64';
import {
  getResource,
  isUrlOnRealm,
  parseProtocol,
  fixRealmUrl,
  autocompleteRealmPieces,
  autocompleteRealm,
  isUrlAbsolute,
  isUrlRelative,
  isUrlPathAbsolute,
} from '../url';
import type { Auth } from '../../types';
import type { AutocompletionDefaults } from '../url';

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

describe('fixRealmUrl', () => {
  test('undefined input results in empty string', () => {
    expect(fixRealmUrl()).toEqual('');
  });

  test('empty url input results in empty string', () => {
    expect(fixRealmUrl('')).toEqual('');
  });

  test('when a realm url is missing a protocol, prepend https', () => {
    expect(fixRealmUrl('example.com')).toEqual('https://example.com');
  });

  test('when a realm url has a trailing "/" remove it', () => {
    expect(fixRealmUrl('https://example.com/')).toEqual('https://example.com');
  });

  test('when a realm url has two trailing "/" remove them', () => {
    expect(fixRealmUrl('https://example.com//')).toEqual('https://example.com');
  });

  test('when input url is correct, do not change it', () => {
    expect(fixRealmUrl('https://example.com')).toEqual('https://example.com');
  });

  test('remove white-space around input', () => {
    expect(fixRealmUrl(' https://example.com/  ')).toEqual('https://example.com');
  });

  test('remove white-space inside input', () => {
    const result = fixRealmUrl('https://subdomain   .example.  com/  ');
    expect(result).toEqual('https://subdomain.example.com');
  });
});

describe('autocompleteRealmPieces', () => {
  const exampleData: AutocompletionDefaults = {
    protocol: 'http://',
    domain: 'example.com',
  };

  test('the empty string yields reasonable values', () => {
    const [head, , tail] = autocompleteRealmPieces('', exampleData);
    expect(head).toEqual('http://');
    expect(tail).toEqual('.example.com');
  });

  /* Test that input value is unchanged.

     Future versions of `autocompleteRealmPieces` may alter certain inputs --
     for example, by trimming spaces, standardizing to lowercase, or escaping
     via punycode -- but the particular values tested here should all remain
     unaltered.
  */
  const doSimpleCompletion = (input: string, data?: AutocompletionDefaults) => {
    const [head, output, tail] = autocompleteRealmPieces(input, data ?? exampleData);
    expect(input).toEqual(output);
    return [head, tail];
  };

  test('a plain word is fully autocompleted', () => {
    const [head, tail] = doSimpleCompletion('host-name');
    expect(head).toEqual('http://');
    expect(tail).toEqual('.example.com');
  });

  test('an explicit `http` is recognized', () => {
    const [head, tail] = doSimpleCompletion('http://host-name');
    expect(head).toBeFalsy();
    expect(tail).toEqual('.example.com');
  });

  test('an explicit `https` is recognized', () => {
    const [head, tail] = doSimpleCompletion('https://host-name');
    expect(head).toBeFalsy();
    expect(tail).toEqual('.example.com');
  });

  test('an explicit IPv4 is recognized', () => {
    const [head, tail] = doSimpleCompletion('23.6.64.128');
    expect(head).toBeTruthy();
    expect(tail).toBeFalsy();
  });

  test('an explicit IPv6 is recognized', () => {
    const [head, tail] = doSimpleCompletion('[2a02:26f0:12f:293:0:0:0:255e]');
    expect(head).toBeTruthy();
    expect(tail).toBeFalsy();
  });

  test('localhost with an explicit port is recognized', () => {
    const [head, tail] = doSimpleCompletion('localhost:9991');
    expect(head).toBeTruthy();
    expect(tail).toBeFalsy();
  });

  test('full host name is recognized', () => {
    const [head, tail] = doSimpleCompletion('my-server.example.com');
    expect(head).toBeTruthy();
    expect(tail).toBeFalsy();
  });

  test('full host and protocol are recognized', () => {
    const [head, tail] = doSimpleCompletion('http://my-server.com');
    expect(head).toBeFalsy();
    expect(tail).toBeFalsy();
  });

  test('fully explicit localhost is recognized', () => {
    const [head, tail] = doSimpleCompletion('http://localhost:9991');
    expect(head).toBeFalsy();
    expect(tail).toBeFalsy();
  });
});

describe('autocompleteRealm', () => {
  const zulipData: AutocompletionDefaults = {
    protocol: 'https://',
    domain: 'zulipchat.com',
  };

  test('when no value is entered return empty string', () => {
    const result = autocompleteRealm('', zulipData);
    expect(result).toEqual('');
  });

  test('when a protocol is provided, use it', () => {
    const result = autocompleteRealm('http://example', zulipData);
    expect(result).toEqual('http://example.zulipchat.com');
  });

  test('do not use any other protocol than http and https', () => {
    const result = autocompleteRealm('ftp://example', zulipData);
    expect(result).toStartWith('https://ftp://');
  });

  test('if the hostname contains a dot, consider it complete', () => {
    const result = autocompleteRealm('mydomain.org', zulipData);
    expect(result).toEqual('https://mydomain.org');
  });

  test('if the hostname contains multiple dots, consider it complete', () => {
    const result = autocompleteRealm('subdomain.mydomain.org', zulipData);
    expect(result).toEqual('https://subdomain.mydomain.org');
  });

  test('if the hostname contains a colon, consider it complete', () => {
    const result = autocompleteRealm('localhost:9991', zulipData);
    expect(result).toEqual('https://localhost:9991');
  });
});
