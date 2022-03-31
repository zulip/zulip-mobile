/* @flow strict-local */
import type { ApiResponse, Auth } from '../transportTypes';
import { apiPost } from '../apiFetch';

/** See https://zulip.com/api/create-stream */
export default (
  auth: Auth,
  name: string,
  description?: string = '',
  // TODO(server-3.0): Send numeric user IDs (#3764), not emails.
  principals?: $ReadOnlyArray<string> = [],
  inviteOnly?: boolean = false,
  is_web_public?: boolean = false,
  history_public_to_subscribers?: boolean = false,
  announce?: boolean = false,
): Promise<ApiResponse> =>
  apiPost(auth, 'users/me/subscriptions', {
    subscriptions: JSON.stringify([{ name, description }]),
    principals: JSON.stringify(principals),
    invite_only: inviteOnly,
    is_web_public,
    history_public_to_subscribers,
    announce,
  });
