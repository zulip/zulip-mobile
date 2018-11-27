/* @flow strict-local */
import type { ApiResponse, Auth } from '../apiTypes';
import { apiPatch } from '../apiFetch';

export default async (auth: Auth, stream: string, topic: string): Promise<ApiResponse> =>
  apiPatch(auth, 'users/me/subscriptions/muted_topics', res => res, {
    stream,
    topic,
    op: 'remove',
  });
