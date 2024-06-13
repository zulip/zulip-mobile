/* @flow strict-local */

import type { ApiResponse, Auth } from '../transportTypes';
import { apiPost } from '../apiFetch';

/** See https://zulip.com/api/send-message */
export default async (
  auth: Auth,
  params: {|
    type: 'direct' | 'stream',
    to: string,
    // TODO(server-2.0): Say "topic", not "subject"
    subject?: string,
    content: string,
    localId?: number,
    eventQueueId?: string,
  |},
  zulipFeatureLevel: number, // TODO(#4659): Don't get this from callers.
): Promise<ApiResponse> => {
  let { type } = params;
  if (type === 'direct' && zulipFeatureLevel < 174) {
    // TODO(server-7.0): Simplify.
    type = 'private';
  }
  return apiPost(auth, 'messages', {
    type,
    to: params.to,
    subject: params.subject,
    content: params.content,
    local_id: params.localId,
    queue_id: params.eventQueueId,
  });
};
