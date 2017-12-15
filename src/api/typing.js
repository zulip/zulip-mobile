/* @flow */
import type { Auth } from '../types';
import { apiPost } from './apiFetch';

export default (auth: Auth, recipients: string, operation: string) =>
  apiPost(auth, 'typing', res => res, {
    to: recipients,
    op: operation,
  });
