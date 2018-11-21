/* @flow */
import type { Account } from '../apiTypes';
import { apiGet } from '../apiFetch';

export default (account: Account): any => apiGet(account, 'users/me/user_groups');
