/* @flow strict-local */
import type { ApiResponse, Auth } from '../transportTypes';
import type { Stream } from '../modelTypes';
import { apiPatch } from '../apiFetch';

/**
 * https://zulip.com/api/update-stream
 *
 * NB the caller must adapt for old-server compatibility; see comments.
 */
// Current to FL 121; property ordering follows the doc.
export default (
  auth: Auth,
  id: number,
  params: $ReadOnly<{|
    // TODO(#4659): Once we pass the feature level to API methods, this one
    //   should encapsulate a switch at FL 64 related to these two parameters.
    //   See call sites.
    description?: Stream['description'],
    new_name?: Stream['name'],

    // controls the invite_only property
    is_private?: Stream['invite_only'],

    // TODO(server-5.0): New in FL 98.
    is_web_public?: Stream['is_web_public'],

    // TODO(server-3.0): New in FL 1; for older servers, pass is_announcement_only.
    stream_post_policy?: Stream['stream_post_policy'],

    // N.B.: Don't pass this without also passing is_web_public; see
    //   https://chat.zulip.org/#narrow/stream/378-api-design/topic/PATCH.20.2Fstreams.2F.7Bstream_id.7D/near/1383984
    history_public_to_subscribers?: Stream['history_public_to_subscribers'],

    // Doesn't take the same special values as Stream.message_retention_days!
    //   https://chat.zulip.org/#narrow/stream/412-api-documentation/topic/message_retention_days/near/1367895
    // TODO(server-3.0): New in FL 17
    message_retention_days?:
      | number
      | 'realm_default'
      // TODO(server-5.0): Added in FL 91, replacing 'forever'.
      | 'unlimited'
      // TODO(server-5.0): Replaced in FL 91 by 'unlimited'.
      | 'forever',

    // TODO(server-3.0): Replaced in FL 1 by 'stream_post_policy'.
    is_announcement_only?: Stream['is_announcement_only'],
  |}>,
): Promise<ApiResponse> => apiPatch(auth, `streams/${id}`, params);
