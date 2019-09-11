/* eslint-disable spellcheck/spell-checker */
import base64 from 'base-64';
import {
  getFullUrl,
  getResource,
  isUrlOnRealm,
  hasProtocol,
  fixRealmUrl,
  autocompleteUrl,
} from '../url';

describe('getFullUrl', () => {
  test('when uri contains domain, do not change', () => {
    const url = getFullUrl('https://example.com/img.gif', '');
    expect(url).toEqual('https://example.com/img.gif');
  });

  test('when uri does not contain domain, append realm', () => {
    const url = getFullUrl('/img.gif', 'https://example.com');
    expect(url).toEqual('https://example.com/img.gif');
  });

  test('recognize relative uris', () => {
    const url = getFullUrl('#something', 'https://example.com');
    expect(url).toEqual('https://example.com/#something');
  });
});

describe('getResource', () => {
  test('when uri contains domain, do not change, add auth headers', () => {
    const auth = {
      realm: '',
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

  const exampleAuth = {
    realm: 'https://example.com',
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
  test('when link is on realm, return true', () => {
    expect(isUrlOnRealm('/#narrow/stream/jest', 'https://example.com')).toBe(true);

    expect(isUrlOnRealm('https://example.com/#narrow/stream/jest', 'https://example.com')).toBe(
      true,
    );

    expect(isUrlOnRealm('#narrow/#near/1', 'https://example.com')).toBe(true);
  });

  test('when link is on not realm, return false', () => {
    expect(isUrlOnRealm('https://demo.example.com', 'https://example.com')).toBe(false);

    expect(isUrlOnRealm('www.google.com', 'https://example.com')).toBe(false);
  });
});

describe('hasProtocol', () => {
  test('detects strings that have no http/https protocol', () => {
    expect(hasProtocol(undefined)).toBe(false);
    expect(hasProtocol('')).toBe(false);
    expect(hasProtocol('chat.zulip.com')).toBe(false);
    expect(hasProtocol('ftp://chat.zulip.com')).toBe(false);
  });

  test('recognizes strings that include the http/https protocol', () => {
    expect(hasProtocol('http://chat.zulip.com')).toBe(true);
    expect(hasProtocol('https://chat.zulip.com')).toBe(true);
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

describe('autocompleteUrl', () => {
  test('when no value is entered return empty string', () => {
    const result = autocompleteUrl('', 'https://', '.zulipchat.com');
    expect(result).toEqual('');
  });

  test('when an protocol is provided use it', () => {
    const result = autocompleteUrl('http://example', 'https://', '.zulipchat.com');
    expect(result).toEqual('http://example.zulipchat.com');
  });

  test('do not use any other protocol than http and https', () => {
    const result = autocompleteUrl('ftp://example', 'https://', '.zulipchat.com');
    expect(result).toEqual('https://ftp://example.zulipchat.com');
  });

  test('if more than one dots in input do not use any append', () => {
    const result = autocompleteUrl('subdomain.mydomain.org', 'https://', '.zulipchat.com');
    expect(result).toEqual('https://subdomain.mydomain.org');
  });

  test('when no subdomain entered do not append top-level domain', () => {
    const result = autocompleteUrl('mydomain.org', 'https://', '.zulipchat.com');
    expect(result).toEqual('https://mydomain.org');
  });
});
