/* @flow */
import type { Account } from '../apiTypes';
import { apiGet } from '../apiFetch';

export default (auth: Account, id: number): any => apiGet(auth, `realm/user_groups/${id}`);
