/* @flow strict-local */
import type { ApiResponse, Auth } from '../transportTypes';
import { apiPatch } from '../apiFetch';

// TODO(#4701): Make an API method for DELETE /messages/{id}. Use it to
// implement the permanent message deletion capability:
//   https://zulip.com/help/configure-message-editing-and-deletion
// To do so, we'll need input from realm_delete_own_message_policy,
// realm_message_content_delete_limit_seconds, the user's role, the current
// time, and maybe more; we'll want #3898 if we can.
export default async (auth: Auth, id: number): Promise<ApiResponse> =>
  apiPatch(auth, `messages/${id}`, {
    content: '',
  });
