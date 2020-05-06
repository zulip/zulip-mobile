/* @flow strict-local */
import type { ApiResponseSuccess, Auth } from '../transportTypes';
import { apiPost } from '../apiFetch';

type UserStatusParams = {|
  away?: boolean,
  status_text?: string,
|};

export default (auth: Auth, params: UserStatusParams): Promise<ApiResponseSuccess> =>
  apiPost(auth, 'users/me/status', params);
