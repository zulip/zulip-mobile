/* @flow */
import type { Account, User } from '../apiTypes';
import { apiGet } from '../apiFetch';

export default (account: Account): Promise<User[]> =>
  apiGet(account, 'users', res => res.members, { client_gravatar: true });
