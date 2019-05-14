/* @flow strict-local */
import { isClientError, ApiError } from '../apiErrors';

describe('isClientError', () => {
  test('an API error with error code between 400 and 499 is a "client error"', () => {
    const error = new ApiError(404, {
      code: 'BAD_IMAGE',
      result: 'error',
      msg: 'File not found',
    });
    const result = isClientError(error);
    expect(result).toBe(true);
  });

  test('an API error with error code between 500 and 599 is not a "client error"', () => {
    const error = new ApiError(500, {
      code: 'BAD_REQUEST',
      result: 'error',
      msg: 'Internal server error',
    });
    const result = isClientError(error);
    expect(result).toBe(false);
  });
});
