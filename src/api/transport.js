/* @flow strict-local */
import base64 from 'base-64';

import type { Auth } from './transportTypes';

export const getAuthHeaders = (auth: Auth): {| Authorization?: string |} =>
  // The `Object.freeze`` in the `:` case avoids a Flow issue:
  // https://github.com/facebook/flow/issues/2386#issuecomment-695064325
  auth.apiKey
    ? { Authorization: `Basic ${base64.encode(`${auth.email}:${auth.apiKey}`)}` }
    : Object.freeze({});
