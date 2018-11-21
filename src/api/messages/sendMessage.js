/* @flow */

import type { ApiResponse, Account } from '../apiTypes';
import { apiPost } from '../apiFetch';

export default async (
  account: Account,
  type: 'private' | 'stream',
  to: string,
  subject: string,
  content: string,
  localId: number,
  eventQueueId: number,
): Promise<ApiResponse> =>
  apiPost(account, 'messages', res => res, {
    type,
    to,
    subject,
    content,
    local_id: localId,
    queue_id: eventQueueId,
  });
