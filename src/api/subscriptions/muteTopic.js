/* @flow strict-local */
import type { ApiResponse, Auth } from '../apiTypes';
import { apiPatch } from '../apiFetch';

/** See https://zulipchat.com/api/mute-topics */
export default async (auth: Auth, stream: string, topic: string): Promise<ApiResponse> =>
  apiPatch(auth, 'users/me/subscriptions/muted_topics', res => res, {
    stream,
    topic,
    op: 'add',
  });
