/* eslint-disable spellcheck/spell-checker */
import {
  getFullUrl,
  getResource,
  isUrlOnRealm,
  isEmojiUrl,
  getEmojiUrl,
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
    const expectedResult = {
      uri: 'https://example.com/img.gif',
      headers: {
        Authorization: 'Basic am9obmRvZUBleGFtcGxlLmNvbTpzb21lQXBpS2V5',
      },
    };
    const resource = getResource('https://example.com/img.gif', {
      realm: '',
      apiKey: 'someApiKey',
      email: 'johndoe@example.com',
    });
    expect(resource).toEqual(expectedResult);
  });

  test('when uri does not contain domain, append realm, add auth headers', () => {
    const expectedResult = {
      uri: 'https://example.com/img.gif',
      headers: {
        Authorization: 'Basic dW5kZWZpbmVkOnNvbWVBcGlLZXk=',
      },
    };
    const resource = getResource('/img.gif', {
      realm: 'https://example.com',
      apiKey: 'someApiKey',
    });
    expect(resource).toEqual(expectedResult);
  });

  test('when uri is on different domain than realm, do not include auth headers', () => {
    const expectedResult = {
      uri: 'https://another.com/img.gif',
    };
    const resource = getResource('https://another.com/img.gif', {
      realm: 'https://example.com',
      apiKey: 'someApiKey',
    });
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

describe('isEmojiUrl', () => {
  test('when url is on realm, but not an emoji url', () => {
    const result = isEmojiUrl('/user_uploads/abc.png', 'https://example.com');
    expect(result).toBe(false);
  });
  test('when url is on realm and emoji', () => {
    const result = isEmojiUrl(
      '/static/generated/emoji/images/emoji/unicode/1f680.png',
      'https://example.com',
    );
    expect(result).toBe(true);
  });
});

describe('getEmojiUrl', () => {
  test('when unicode is passed, output relative link on server', () => {
    const url = getEmojiUrl('1f680');
    expect(url).toBe('/static/generated/emoji/images/emoji/unicode/1f680.png');
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
