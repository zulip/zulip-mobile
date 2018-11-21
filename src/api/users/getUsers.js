/* @flow */
import type { Account, User } from '../apiTypes';
import { apiGet } from '../apiFetch';

export default (auth: Account): Promise<User[]> =>
  apiGet(auth, 'users', res => res.members, { client_gravatar: true });
