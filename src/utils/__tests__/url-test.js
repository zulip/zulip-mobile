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
        Authorization: 'Basic dG9kb0B0b2RvOnRvZG9fa2V5', // eslint-disable-line
      },
    };
    const context = getResourceWithAuth('https://example.com/img.gif', '', '');
    expect(context).toEqual(expectedResult);
  });

  test('when uri does not contain domain, append realm, add auth headers', () => {
    const expectedResult = {
      uri: 'https://example.com/img.gif',
      headers: {
        Authorization: 'Basic dG9kb0B0b2RvOnRvZG9fa2V5', // eslint-disable-line
      },
    };
    const context = getResourceWithAuth('/img.gif', 'https://example.com', 'someAuthHead');
    expect(context).toEqual(expectedResult);
  });
});
