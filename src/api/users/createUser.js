/* @flow strict-local */
import type { ApiResponseSuccess, Auth } from '../apiTypes';
import { apiPost } from '../apiFetch';

/**
 * See https://zulipchat.com/api/create-user
 * Note: The requesting user must be an administrator.
 */
export default (
  auth: Auth,
  email: string,
  password: string,
  fullName: string,
  shortName: string,
): Promise<ApiResponseSuccess> =>
  apiPost(auth, 'users', res => res, {
    email,
    password,
    full_name: fullName,
    short_name: shortName,
  });
