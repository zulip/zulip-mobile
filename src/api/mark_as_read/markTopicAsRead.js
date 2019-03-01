/* @flow strict-local */
import type { ApiResponse, Auth } from '../transportTypes';
import { apiPost } from '../apiFetch';

export default async (auth: Auth, streamId: number, topic: string): Promise<ApiResponse> =>
  apiPost(auth, 'mark_topic_as_read', {
    stream_id: streamId,
    topic_name: topic,
  });
