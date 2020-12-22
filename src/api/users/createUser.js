/* @flow strict-local */
import type { ApiResponseSuccess, Auth } from '../transportTypes';
import { apiPost } from '../apiFetch';

/**
 * See https://zulip.com/api/create-user
 * Note: The requesting user must be an administrator.
 */
export default (
  auth: Auth,
  email: string,
  password: string,
  fullName: string,
  shortName: string,
): Promise<ApiResponseSuccess> =>
  apiPost(auth, 'users', {
    email,
    password,
    full_name: fullName,
    short_name: shortName,
  });
