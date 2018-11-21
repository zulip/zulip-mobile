/* @flow */
import type { Account, RealmFilter } from '../apiTypes';
import { apiGet } from '../apiFetch';

export default async (auth: Account): Promise<RealmFilter[]> =>
  apiGet(auth, 'realm/filters', res => res.filters);
