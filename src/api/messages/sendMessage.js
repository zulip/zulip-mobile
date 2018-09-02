/* @flow strict-local */

import type { ApiResponse, Auth } from '../apiTypes';
import { apiPost } from '../apiFetch';

/** See https://zulipchat.com/api/send-message */
export default async (
  auth: Auth,
  type: 'private' | 'stream',
  to: string,
  subject: string,
  content: string,
  localId: number,
  eventQueueId: number,
): Promise<ApiResponse> =>
  apiPost(auth, 'messages', res => res, {
    type,
    to,
    subject,
    content,
    local_id: localId,
    queue_id: eventQueueId,
  });
