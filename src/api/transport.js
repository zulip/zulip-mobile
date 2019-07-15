/* @flow strict-local */
import base64 from 'base-64';

export const getAuthHeader = (email: string, apiKey: string): ?string =>
  apiKey ? `Basic ${base64.encode(`${email}:${apiKey}`)}` : undefined;
