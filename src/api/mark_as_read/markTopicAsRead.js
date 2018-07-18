/* @flow */
import type { ApiResponse, Auth } from '../apiTypes';
import { apiPost } from '../apiFetch';

export default async (auth: Auth, streamId: number, topic: string): Promise<ApiResponse> =>
  apiPost(auth, 'mark_topic_as_read', res => res, {
    stream_id: streamId,
    topic_name: topic,
  });
