/* @flow strict-local */

import type { ApiResponse, Auth } from '../transportTypes';
import { apiPost } from '../apiFetch';

type CommonParams = {|
  content: string,
  localId?: number,
  eventQueueId?: string,
|};

/** See https://zulip.com/api/send-message */
export default async (
  auth: Auth,
  // prettier-ignore
  params:
    // TODO(server-2.0): Say "topic", not "subject"
    | {| ...CommonParams, type: 'stream', to: string, subject: string |}
    | {| ...CommonParams, type: 'private', to: string |},
): Promise<ApiResponse> =>
  apiPost(auth, 'messages', {
    type: params.type,
    to: params.to,
    subject: (params: { +subject?: string, ... }).subject,
    content: params.content,
    local_id: params.localId,
    queue_id: params.eventQueueId,
  });
