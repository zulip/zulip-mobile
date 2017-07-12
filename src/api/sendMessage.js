/* @flow */
import type { Auth } from '../types';
import { apiPost } from './apiFetch';

export default async (
  auth: Auth,
  type: 'private' | 'stream',
  to: string | string[],
  subject: string,
  content: string,
) =>
  apiPost(auth, 'messages', res => res.messages, {
    type,
    to,
    subject,
    content,
  });
