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
  invite_only?: boolean = false,
  announce?: boolean = false,
): Promise<ApiResponse> =>
  apiPost(auth, 'users/me/subscriptions', {
    subscriptions: JSON.stringify([{ name, description }]),
    principals: JSON.stringify(principals),
    invite_only,
    announce,
  });
