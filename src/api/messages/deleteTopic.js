/* @flow strict-local */
import type { ApiResponse, Auth } from '../transportTypes';
import { apiPost } from '../apiFetch';

/**
 * Delete all messages in a stream for a given topic.
 */
export default async (auth: Auth, streamId: number, topicName: string): Promise<ApiResponse> =>
  apiPost(auth, `streams/${streamId}/delete_topic`, {
    topic_name: topicName,
  });
