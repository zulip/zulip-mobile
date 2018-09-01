/* @flow strict-local */
import type { Auth, User } from '../apiTypes';
import { apiGet } from '../apiFetch';

/** See https://zulipchat.com/api/get-all-users */

type ApiResponseUsers = ApiResponseSuccess & {
  members: User[],
};

export default (auth: Auth, clientGravatar: boolean = true): Promise<ApiResponseUsers> =>
  apiGet(auth, 'users', {
    client_gravatar: clientGravatar,
  });
