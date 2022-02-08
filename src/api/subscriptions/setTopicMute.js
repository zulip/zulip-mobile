/* @flow strict-local */
import type { ApiResponse, Auth } from '../transportTypes';
import { apiPatch } from '../apiFetch';

/** See https://zulip.com/api/mute-topic */
export default async (
  auth: Auth,
  // TODO(server-2.0): Switch to stream ID (#3918), instead of name.
  //   (The version that was introduced in isn't documented:
  //     https://github.com/zulip/zulip/issues/11136#issuecomment-1033046851
  //   but see:
  //     https://github.com/zulip/zulip-mobile/issues/3244#issuecomment-840200325
  //   )
  stream: string,
  topic: string,
  value: boolean,
): Promise<ApiResponse> =>
  apiPatch(auth, 'users/me/subscriptions/muted_topics', {
    stream,
    topic,
    op: value ? 'add' : 'remove',
  });
