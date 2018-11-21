/* @flow */
import type { Account } from '../apiTypes';
import { apiGet } from '../apiFetch';

export default (auth: Account): any => apiGet(auth, 'users/me/user_groups');
