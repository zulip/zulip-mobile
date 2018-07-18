/* @flow */
import type { Auth } from './apiTypes';
import { apiPost } from './apiFetch';

export default async (auth: Auth, to: string, op: 'start' | 'stop') =>
  apiPost(auth, 'typing', res => res.messages, {
    to,
    op,
  });
