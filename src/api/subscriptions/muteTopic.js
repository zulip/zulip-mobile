/* @flow */
import type { ApiResponse, Account } from '../apiTypes';
import { apiPatch } from '../apiFetch';

export default async (auth: Account, stream: string, topic: string): Promise<ApiResponse> =>
  apiPatch(auth, 'users/me/subscriptions/muted_topics', res => res, {
    stream,
    topic,
    op: 'add',
  });
