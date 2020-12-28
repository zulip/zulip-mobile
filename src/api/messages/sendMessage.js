/* @flow strict-local */

import type { ApiResponse, Auth } from '../transportTypes';
import { apiPost } from '../apiFetch';

/** See https://zulip.com/api/send-message */
export default async (
  auth: Auth,
  params: {|
    type: 'private' | 'stream',
    to: string,
    subject?: string,
    content: string,
    localId?: number,
    eventQueueId?: number,
  |},
): Promise<ApiResponse> =>
  apiPost(auth, 'messages', {
    type: params.type,
    to: params.to,
    subject: params.subject,
    content: params.content,
    local_id: params.localId,
    queue_id: params.eventQueueId,
  });
