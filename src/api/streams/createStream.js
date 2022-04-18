/* @flow strict-local */
import type { ApiResponse, Auth } from '../transportTypes';
import { apiPost } from '../apiFetch';

/** See https://zulip.com/api/create-stream */
export default (
  auth: Auth,
  streamAttributes: $ReadOnly<{|
    // Ordered by their appearance in the doc.

    name: string,
    description?: string,
    invite_only?: boolean,
  |}>,
  options?: $ReadOnly<{|
    // TODO(server-3.0): Send numeric user IDs (#3764), not emails.
    principals?: $ReadOnlyArray<string>,

    announce?: boolean,
  |}>,
): Promise<ApiResponse> => {
  const { name, description = '', invite_only = false } = streamAttributes;
  const { principals = [], announce = false } = options ?? {};
  return apiPost(auth, 'users/me/subscriptions', {
    subscriptions: JSON.stringify([{ name, description }]),
    invite_only,

    principals: JSON.stringify(principals),
    announce,
  });
};
