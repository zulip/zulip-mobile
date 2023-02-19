/* @flow strict-local */
import type { Auth } from './transportTypes';
import { base64Utf8Encode } from '../utils/encoding';

export const getAuthHeaders = (auth: Auth): {| Authorization?: string |} =>
  // The `Object.freeze`` in the `:` case avoids a Flow issue:
  // https://github.com/facebook/flow/issues/2386#issuecomment-695064325
  auth.apiKey
    ? { Authorization: `Basic ${base64Utf8Encode(`${auth.email}:${auth.apiKey}`)}` }
    : Object.freeze({});
