/* @flow */
import type { ApiResponse, Account } from '../apiTypes';
import { apiPost } from '../apiFetch';

export default async (account: Account, streamId: number, topic: string): Promise<ApiResponse> =>
  apiPost(account, 'mark_topic_as_read', res => res, {
    stream_id: streamId,
    topic_name: topic,
  });
