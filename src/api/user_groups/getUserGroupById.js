/* @flow */
import type { Account } from '../apiTypes';
import { apiGet } from '../apiFetch';

export default (account: Account, id: number): any => apiGet(account, `realm/user_groups/${id}`);
