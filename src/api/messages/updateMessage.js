/* @flow strict-local */
import type { ApiResponse, Auth } from '../transportTypes';
import type { PropagateMode } from '../modelTypes';
import { apiPatch } from '../apiFetch';

/**
 * https://zulip.com/api/update-message
 *
 * NB the caller must manage old-server compatibility:
 * `send_notification_to_old_thread` and `send_notification_to_new_thread`
 * are available only starting with FL 9.
 */
// TODO(#4659): Once we pass the feature level to API methods, this one
//   should encapsulate dropping send_notification_* when unsupported.
// TODO(server-3.0): Simplify that away.
export default async (
  auth: Auth,
  params: $ReadOnly<{|
    // TODO(server-2.0): Say "topic", not "subject"
    subject?: string,

    propagate_mode?: PropagateMode,
    content?: string,

    send_notification_to_old_thread?: boolean,
    send_notification_to_new_thread?: boolean,
  |}>,
  id: number,
): Promise<ApiResponse> => apiPatch(auth, `messages/${id}`, params);
