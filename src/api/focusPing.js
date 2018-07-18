/* @flow */
import type { ApiResponseWithPresence, Auth } from './apiTypes';
import { apiPost } from './apiFetch';

export default (
  auth: Auth,
  hasFocus: boolean = true,
  newUserInput: boolean = false,
): Promise<ApiResponseWithPresence> =>
  apiPost(auth, 'users/me/presence', res => res, {
    status: hasFocus ? 'active' : 'idle',
    new_user_input: newUserInput,
  });
