/* @flow strict-local */
import type { Auth, ApiResponseSuccess } from '../transportTypes';
import type { User } from '../apiTypes';
import { apiGet } from '../apiFetch';

type ApiResponseUsers = {|
  ...ApiResponseSuccess,
  members: User[],
|};

/** See https://zulip.com/api/get-all-users */
export default (auth: Auth): Promise<ApiResponseUsers> =>
  apiGet(auth, 'users', { client_gravatar: true });
