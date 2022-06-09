/* @flow strict-local */
import type { ApiResponse, Auth } from '../transportTypes';
import type { Stream } from '../modelTypes';
import { apiPost } from '../apiFetch';

/**
 * See https://zulip.com/api/create-stream
 *
 * NB the caller must adapt for old-server compatibility; see comments.
 */
// Current to FL 121.
// TODO(#4659): Once we pass the feature level to API methods, this one
//   should encapsulate various feature-level switches; see comments.
export default (
  auth: Auth,
  streamAttributes: $ReadOnly<{|
    // Ordered by their appearance in the doc.

    name: Stream['name'],
    description?: Stream['description'],
    invite_only?: Stream['invite_only'],

    // TODO(server-5.0): New in FL 98
    is_web_public?: Stream['is_web_public'],

    history_public_to_subscribers?: Stream['history_public_to_subscribers'],

    // TODO(server-3.0): New in FL 1; for older servers, pass is_announcement_only.
    stream_post_policy?: Stream['stream_post_policy'],

    // Doesn't take the same special values as Stream.message_retention_days!
    //   https://chat.zulip.org/#narrow/stream/412-api-documentation/topic/message_retention_days/near/1367895
    // TODO(server-3.0): New in FL 17
    message_retention_days?:
      | number
      | 'realm_default'
      // TODO(server-5.0): New in FL 91, replacing 'forever'.
      | 'unlimited'
      // TODO(server-5.0): Replaced in FL 91 by 'unlimited'.
      | 'forever',

    // TODO(server-3.0): Replaced in FL 1 by 'stream_post_policy'.
    // Commented out because this isn't actually in the doc. It probably
    // exists though? Copied from api.updateStream.
    // is_announcement_only?: Stream['is_announcement_only'],
  |}>,
  options?: $ReadOnly<{|
    // TODO(server-3.0): Send numeric user IDs (#3764), not emails.
    principals?: $ReadOnlyArray<string>,

    authorization_errors_fatal?: boolean,
    announce?: boolean,
  |}>,
): Promise<ApiResponse> => {
  const { name, description, ...restAttributes } = streamAttributes;
  const { principals, ...restOptions } = options ?? {};
  return apiPost(auth, 'users/me/subscriptions', {
    subscriptions: JSON.stringify([{ name, description }]),
    ...restAttributes,

    principals: JSON.stringify(principals),
    ...restOptions,
  });
};
