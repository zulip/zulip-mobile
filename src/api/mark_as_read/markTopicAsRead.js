/* @flow */
import type { ApiResponse, Account } from '../apiTypes';
import { apiPost } from '../apiFetch';

export default async (auth: Account, streamId: number, topic: string): Promise<ApiResponse> =>
  apiPost(auth, 'mark_topic_as_read', res => res, {
    stream_id: streamId,
    topic_name: topic,
  });
