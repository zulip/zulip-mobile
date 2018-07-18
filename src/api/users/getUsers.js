/* @flow */
import type { Auth, User } from '../apiTypes';
import { apiGet } from '../apiFetch';

export default (auth: Auth): Promise<User[]> =>
  apiGet(auth, 'users', res => res.members, { client_gravatar: true });
