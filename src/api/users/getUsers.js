/* @flow strict-local */
import type { Auth, User } from '../apiTypes';
import { apiGet } from '../apiFetch';

/** See https://zulipchat.com/api/get-all-users */
export default (auth: Auth): Promise<User[]> =>
  apiGet(auth, 'users', res => res.members, { client_gravatar: true });
