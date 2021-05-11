/* @flow strict-local */
import { isClientError, ApiError, isServerError } from '../apiErrors';

describe('isClientError', () => {
  describe('an API error with error code between 400 and 499', () => {
    const error = new ApiError(404, {
      code: 'BAD_IMAGE',
      result: 'error',
      msg: 'File not found',
    });

    test('is a "client error"', () => {
      expect(isClientError(error)).toBe(true);
    });

    test('is not a "server error"', () => {
      expect(isServerError(error)).toBe(false);
    });
  });

  describe('an API error with error code between 500 and 599', () => {
    const error = new ApiError(500, {
      code: 'SOME_ERROR_CODE',
      msg: 'Internal Server Error',
      result: 'error',
    });

    test('is a "server error"', () => {
      expect(isServerError(error)).toBe(true);
    });

    test('is not a "client error"', () => {
      expect(isClientError(error)).toBe(false);
    });
  });
});
