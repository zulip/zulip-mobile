/* @flow strict-local */
import base64 from 'base-64';

import type { Auth } from './transportTypes';

export const getAuthHeaders = (auth: Auth): { [string]: string } =>
  auth.apiKey ? { Authorization: `Basic ${base64.encode(`${auth.email}:${auth.apiKey}`)}` } : {};
