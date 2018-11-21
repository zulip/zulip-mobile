/* @flow */
import type { ApiResponseWithPresence, Account } from './apiTypes';
import { apiPost } from './apiFetch';

export default (
  auth: Account,
  hasFocus: boolean = true,
  newUserInput: boolean = false,
): Promise<ApiResponseWithPresence> =>
  apiPost(auth, 'users/me/presence', res => res, {
    status: hasFocus ? 'active' : 'idle',
    new_user_input: newUserInput,
  });
