import { getFetchParams } from '../apiFetch';

global.FormData = jest.fn();

describe('getFetchParams', () => {
  test('creates a `header` key with authorization data', () => {
    const account = {
      email: 'john@example.com',
      apiKey: 'some_key',
    };
    const params = {};

    const actualResult = getFetchParams(account, params);

    expect(actualResult.headers).toBeTruthy();
    expect(actualResult.headers.Authorization).toBeTruthy();
  });

  test('merges `headers` key and all given params into a new object', () => {
    const account = {
      email: 'john@example.com',
      apiKey: 'some_key',
    };
    const params = {
      key: 'value',
    };

    const actualResult = getFetchParams(account, params);

    expect(actualResult.key).toBe('value');
  });

  test('when no apiKey provided does not return `Authorization` headers key', () => {
    const account = {
      email: 'john@example.com',
      apiKey: '',
    };
    const params = {};

    const actualResult = getFetchParams(account, params);

    expect(actualResult.headers).toBeTruthy();
    expect(actualResult.headers.Authorization).toBeUndefined();
  });
});
