// @flow strict-local
import type { UserTopicVisibilityPolicy } from '../modelTypes';
import type { ApiResponseSuccess, Auth } from '../transportTypes';
import { apiPost } from '../apiFetch';

/** https://chat.zulip.org/api/update-user-topic */
export default function updateUserTopic(
  auth: Auth,
  stream_id: number,
  topic: string,
  visibility_policy: UserTopicVisibilityPolicy,
): Promise<ApiResponseSuccess> {
  return apiPost(auth, '/user_topics', {
    stream_id,
    topic,
    visibility_policy: (visibility_policy: number),
  });
}
