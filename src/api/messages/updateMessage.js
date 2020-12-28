/* @flow strict-local */
import type { ApiResponse, Auth } from '../transportTypes';
import { apiPatch } from '../apiFetch';

/** See https://zulip.com/api/update-message */
export default async (
  auth: Auth,
  params: $ReadOnly<{|
    subject?: string,
    propagate_mode?: boolean,
    content?: string,
  |}>,
  id: number,
): Promise<ApiResponse> => apiPatch(auth, `messages/${id}`, params);
