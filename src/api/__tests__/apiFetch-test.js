import { objectToParams, getFetchParams } from '../apiFetch';

global.FormData = jest.fn();

describe('objectToParams', () => {
  test('object consisting of numbers, strings or booleans is not changed', () => {
    const obj = {
      numKey: 123,
      strKey: 'str',
      boolKey: true,
    };
    const result = objectToParams(obj);
    expect(result).toEqual(obj);
  });

  test('keys with values of "undefined" are skipped, "null" keys are left as-is', () => {
    const obj = {
      strKey: 'str',
      nullKey: null,
      undefinedKey: undefined,
    };
    const expected = {
      strKey: 'str',
      nullKey: null,
    };
    const result = objectToParams(obj);
    expect(result).toEqual(expected);
    expect(result).toHaveProperty('strKey');
    expect(result).toHaveProperty('nullKey');
    expect(result).not.toHaveProperty('undefinedKey');
  });

  test('arrays are JSON-stringified', () => {
    const obj = {
      numKey: 123,
      arrKey: [1, 2, 3],
    };
    const expected = {
      numKey: 123,
      arrKey: '[1,2,3]',
    };
    const result = objectToParams(obj);
    expect(result).toEqual(expected);
  });
});

describe('getFetchParams', () => {
  test('creates a `header` key with authorization data', () => {
    const auth = {
      email: 'john@example.com',
      apiKey: 'some_key',
    };
    const params = {};

    const actualResult = getFetchParams(auth, params);

    expect(actualResult.headers).toBeTruthy();
    expect(actualResult.headers.Authorization).toBeTruthy();
  });

  test('merges `headers` key and all given params into a new object', () => {
    const auth = {
      email: 'john@example.com',
      apiKey: 'some_key',
    };
    const params = {
      key: 'value',
    };

    const actualResult = getFetchParams(auth, params);

    expect(actualResult.key).toBe('value');
  });

  test('when no apiKey provided does not return `Authorization` headers key', () => {
    const auth = {
      email: 'john@example.com',
      apiKey: '',
    };
    const params = {};

    const actualResult = getFetchParams(auth, params);

    expect(actualResult.headers).toBeTruthy();
    expect(actualResult.headers.Authorization).toBeUndefined();
  });
});
