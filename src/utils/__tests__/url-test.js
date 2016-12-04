import { getFullUrl, getResourceWithAuth } from '../url';

describe('getFullUrl', () => {
  test('when uri contains domain, do not change', () => {
    const url = getFullUrl('https://example.com/img.gif', '');
    expect(url).toEqual('https://example.com/img.gif');
  });

  test('when uri does not contain domain, append realm', () => {
    const url = getFullUrl('/img.gif', 'https://example.com');
    expect(url).toEqual('https://example.com/img.gif');
  });
});

describe('getResourceWithAuth', () => {
  test('when uri contains domain, do not change, add auth headers', () => {
    const expectedResult = {
      uri: 'https://example.com/img.gif',
      headers: {
        Authorization: 'Basic am9obmRvZUBleGFtcGxlLmNvbTpzb21lQXBpS2V5', // eslint-disable-line
      },
    };
    const resource = getResourceWithAuth(
      'https://example.com/img.gif',
      { realm: '', apiKey: 'someApiKey', email: 'johndoe@example.com' },
    );
    expect(resource).toEqual(expectedResult);
  });

  test('when uri does not contain domain, append realm, add auth headers', () => {
    const expectedResult = {
      uri: 'https://example.com/img.gif',
      headers: {
        Authorization: 'Basic dW5kZWZpbmVkOnNvbWVBcGlLZXk=', // eslint-disable-line
      },
    };
    const resource = getResourceWithAuth(
      '/img.gif',
      { realm: 'https://example.com', apiKey: 'someApiKey' },
    );
    expect(resource).toEqual(expectedResult);
  });
});
