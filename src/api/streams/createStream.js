/* @flow strict-local */
import type { ApiResponse, Auth } from '../transportTypes';
import { apiPost } from '../apiFetch';

/** See https://zulip.com/api/create-stream */
export default (
  auth: Auth,
  params: $ReadOnly<{|
    name: string,
    description?: string,
    // TODO(server-3.0): Send numeric user IDs (#3764), not emails.
    principals?: $ReadOnlyArray<string>,
    invite_only?: boolean,
    is_web_public?: boolean,
    history_public_to_subscribers?: boolean,
    announce?: boolean,
  |}>,
): Promise<ApiResponse> => {
  const {
    name,
    description = '',
    principals = [],
    invite_only = false,
    is_web_public = false,
    history_public_to_subscribers = false,
    announce = false,
  } = params;
  return apiPost(auth, 'users/me/subscriptions', {
    subscriptions: JSON.stringify([{ name, description }]),
    principals: JSON.stringify(principals),
    invite_only,
    is_web_public,
    history_public_to_subscribers,
    announce,
  });
};
