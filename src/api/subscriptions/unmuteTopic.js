/* @flow */
import type { Auth } from '../../types';
import { apiPatch } from '../apiFetch';

export default async (auth: Auth, stream: string, topic: string) =>
  apiPatch(auth, 'users/me/subscriptions/muted_topics', res => res, {
    stream,
    topic,
    op: 'remove',
  });
