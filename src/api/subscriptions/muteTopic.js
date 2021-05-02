/* @flow strict-local */
import type { ApiResponse, Auth } from '../transportTypes';
import { apiPatch } from '../apiFetch';

/** See https://zulip.com/api/mute-topic */
export default async (auth: Auth, stream: string, topic: string): Promise<ApiResponse> =>
  apiPatch(auth, 'users/me/subscriptions/muted_topics', {
    stream,
    topic,
    op: 'add',
  });
