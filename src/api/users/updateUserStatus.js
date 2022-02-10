/* @flow strict-local */
import type { ApiResponseSuccess, Auth } from '../transportTypes';
import { apiPost } from '../apiFetch';

type UserStatusParams = {|
  away?: boolean,
  status_text?: string,
|};

// TODO: Take a partial UserStatus object from our user-status model.
//   Partial because servers allow updating just part of the status in a
//   request, and it's nice to let callers do that. First need to make
//   missing/`undefined` stop being meaningful representations in any of
//   UserStatus's keys.
export default (auth: Auth, params: UserStatusParams): Promise<ApiResponseSuccess> =>
  apiPost(auth, 'users/me/status', params);
