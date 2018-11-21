/* @flow */
import type { Account, RealmFilter } from '../apiTypes';
import { apiGet } from '../apiFetch';

export default async (account: Account): Promise<RealmFilter[]> =>
  apiGet(account, 'realm/filters', res => res.filters);
