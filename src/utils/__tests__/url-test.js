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
      uri: 'https://hi.com/img.gif',
      headers: {
        Authorization: 'Basic dG9kb0B0b2RvOnRvZG9fa2V5', // eslint-disable-line
      },
    };
    const resource = getResourceWithAuth('https://hi.com/img.gif', { realm: '', apiKey: '' });
    expect(resource).toEqual(expectedResult);
  });

  test('when uri does not contain domain, append realm, add auth headers', () => {
    const expectedResult = {
      uri: 'https://hi.com/img.gif',
      headers: {
        Authorization: 'Basic dG9kb0B0b2RvOnRvZG9fa2V5', // eslint-disable-line
      },
    };
    const resource = getResourceWithAuth('/img.gif', { realm: 'https://hi.com', apiKey: '' });
    expect(resource).toEqual(expectedResult);
  });
});
