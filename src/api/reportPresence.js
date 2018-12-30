/* @flow strict-local */
import type { ApiResponseWithPresence, Auth } from './apiTypes';
import { apiPost } from './apiFetch';

/** See https://zulip.readthedocs.io/en/latest/subsystems/presence.html . */
export default (
  auth: Auth,
  hasFocus: boolean = true,
  newUserInput: boolean = false,
): Promise<ApiResponseWithPresence> =>
  apiPost(auth, 'users/me/presence', {
    status: hasFocus ? 'active' : 'idle',
    new_user_input: newUserInput,
  });
