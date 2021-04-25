/* @flow strict-local */
import type { Auth, ApiResponseSuccess } from '../transportTypes';
import { apiDelete } from '../apiFetch';

/** See https://zulip.com/api/deactivate-own-user */
export default (auth: Auth): Promise<ApiResponseSuccess> => apiDelete(auth, '/users/me');
