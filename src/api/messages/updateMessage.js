/* @flow strict-local */
import type { ApiResponse, Auth } from '../transportTypes';
import type { PropagateMode } from '../modelTypes';
import { apiPatch } from '../apiFetch';

/** See https://zulip.com/api/update-message */
export default async (
  auth: Auth,
  params: $ReadOnly<{|
    // TODO(server-2.0): Say "topic", not "subject"
    subject?: string,
    propagate_mode?: PropagateMode,
    content?: string,
  |}>,
  id: number,
): Promise<ApiResponse> => apiPatch(auth, `messages/${id}`, params);
