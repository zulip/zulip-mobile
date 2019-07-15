/* @flow strict-local */
import base64 from 'base-64';

export const getAuthHeaders = (email: string, apiKey: string): { [string]: string } =>
  apiKey ? { Authorization: `Basic ${base64.encode(`${email}:${apiKey}`)}` } : {};
